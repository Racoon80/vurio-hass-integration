"""A small client for Vurio's HTTP API.

Everything goes through one API token, sent as a bearer token: the integration
never signs in as a person, and the token's own permissions and camera scope
are what limit it.
"""

from __future__ import annotations

from collections.abc import AsyncIterator
from datetime import UTC, datetime
import json
from typing import Any
from urllib.parse import quote

import aiohttp
from yarl import URL

# Long enough for a picture cut from footage, which Vurio queues.
REQUEST_TIMEOUT = aiohttp.ClientTimeout(total=30)

# Vurio copies the segments of a clip together before it answers.
CLIP_TIMEOUT = aiohttp.ClientTimeout(total=120)

# The event stream stays open; Vurio sends a keep-alive every fifteen seconds,
# so a minute of silence is a connection that has gone.
STREAM_TIMEOUT = aiohttp.ClientTimeout(total=None, sock_connect=10, sock_read=60)


class VurioError(Exception):
    """Vurio could not be reached or did not answer as expected."""


class VurioAuthError(VurioError):
    """The token was refused."""


class VurioPermissionError(VurioError):
    """The token is valid and lacks a permission this needs."""


class VurioClient:
    """Talks to one Vurio installation."""

    def __init__(self, session: aiohttp.ClientSession, url: str, token: str) -> None:
        self._session = session
        self.url = url.rstrip("/")
        self._headers = {"Authorization": f"Bearer {token}"}

    @property
    def host(self) -> str:
        """The host Vurio answers on, which is also where it restreams."""
        return URL(self.url).host or ""

    async def _request(
        self,
        method: str,
        path: str,
        *,
        params: dict[str, Any] | None = None,
        body: Any = None,
    ) -> aiohttp.ClientResponse:
        try:
            response = await self._session.request(
                method,
                f"{self.url}{path}",
                headers=self._headers,
                params=params,
                json=body,
                timeout=REQUEST_TIMEOUT,
            )
        except (aiohttp.ClientError, TimeoutError) as err:
            raise VurioError(f"Vurio could not be reached: {err}") from err

        _raise_for(response)
        return response

    async def _json(self, path: str, params: dict[str, Any] | None = None) -> Any:
        response = await self._request("GET", path, params=params)
        try:
            return await response.json()
        except (aiohttp.ContentTypeError, ValueError) as err:
            raise VurioError(f"Vurio answered {path} with something that is not JSON") from err

    async def me(self) -> dict[str, Any]:
        """Who the token is, and what it may do."""
        return await self._json("/api/auth/me")

    async def integration(self) -> dict[str, Any]:
        """Every camera the token may see, with its state and sensors."""
        return await self._json("/api/integration")

    async def _picture(self, path: str, params: dict[str, Any]) -> bytes | None:
        try:
            response = await self._request("GET", path, params=params)
        except VurioAuthError:
            raise
        except VurioError:
            # No picture is an answer a camera gives all the time: it is off,
            # or nothing was recorded at that moment yet.
            return None
        return await response.read()

    async def snapshot(self, camera: str, width: int | None = None) -> bytes | None:
        """A picture of the camera now."""
        params = {"width": width} if width else {}
        return await self._picture(f"/api/live/{quote(camera)}/snapshot", params)

    async def latest_event(self, camera: str) -> dict[str, Any] | None:
        """The newest event on a camera, if it has one."""
        page = await self._json("/api/events/recent", {"camera": camera, "limit": 1})
        events = page.get("events") or []
        return events[0] if events else None

    async def event_frame(self, event_id: str, width: int | None = None) -> bytes | None:
        """The picture from the moment of an event."""
        params = {"width": width} if width else {}
        return await self._picture(f"/api/events/{quote(event_id)}/frame", params)

    async def events(
        self, camera: str, limit: int = 50, before: str | None = None
    ) -> list[dict[str, Any]]:
        """A camera's events, newest first."""
        params: dict[str, Any] = {"camera": camera, "limit": limit}
        if before:
            params["before"] = before
        page = await self._json("/api/events/recent", params)
        return list(page.get("events") or [])

    async def coverage(self, camera: str, start: datetime, end: datetime) -> list[dict[str, str]]:
        """The stretches recorded between two moments."""
        answer = await self._json(
            "/api/recordings/coverage",
            {"camera": camera, "from": rfc3339(start), "to": rfc3339(end)},
        )
        return list(answer.get("covered") or [])

    async def timeline(self, cameras: list[str], start: datetime, end: datetime) -> dict[str, Any]:
        """Detections, and what was recorded, between two moments."""
        return await self._json(
            "/api/events/timeline",
            {"cameras": ",".join(cameras), "from": rfc3339(start), "to": rfc3339(end)},
        )

    async def live_socket(self, camera: str, quality: str) -> aiohttp.ClientWebSocketResponse:
        """Vurio's live websocket for one camera: MSE fragments or WebRTC signalling."""
        url = URL(self.url).with_scheme("wss" if URL(self.url).scheme == "https" else "ws")
        try:
            return await self._session.ws_connect(
                str(url.with_path(f"/api/live/{quote(camera)}/ws")),
                params={"quality": quality},
                headers=self._headers,
                heartbeat=30,
                max_msg_size=0,
            )
        except aiohttp.WSServerHandshakeError as err:
            if err.status == 401:
                raise VurioAuthError("Vurio refused the API token") from err
            raise VurioError(f"Vurio refused the live view: {err.status}") from err
        except (aiohttp.ClientError, TimeoutError) as err:
            raise VurioError(f"Vurio's live view could not be reached: {err}") from err

    async def clip(self, camera: str, start: datetime, end: datetime) -> aiohttp.ClientResponse:
        """A few minutes of footage as one mp4, still to be read."""
        try:
            response = await self._session.get(
                f"{self.url}/api/recordings/clip",
                headers=self._headers,
                params={"camera": camera, "from": rfc3339(start), "to": rfc3339(end)},
                timeout=CLIP_TIMEOUT,
            )
        except (aiohttp.ClientError, TimeoutError) as err:
            raise VurioError(f"Vurio could not be reached: {err}") from err

        _raise_for(response)
        return response

    async def switch(self, camera: str, what: str, on: bool) -> None:
        """Switch a camera's recording (`enabled`) or detection on or off."""
        await self._request(
            "PUT", f"/api/cameras/{quote(camera)}/{what}", body={"enabled": on}
        )

    async def stream(self) -> AsyncIterator[tuple[str, Any]]:
        """Vurio's server-sent events, as (event name, decoded data)."""
        try:
            response = await self._session.get(
                f"{self.url}/api/integration/stream",
                headers={**self._headers, "Accept": "text/event-stream"},
                timeout=STREAM_TIMEOUT,
            )
        except (aiohttp.ClientError, TimeoutError) as err:
            raise VurioError(f"Vurio's event stream could not be opened: {err}") from err

        _raise_for(response)

        async with response:
            name: str | None = None
            data: list[str] = []

            async for raw in response.content:
                line = raw.decode("utf-8", errors="replace").rstrip("\r\n")

                if not line:
                    if data:
                        yield name or "message", json.loads("\n".join(data))
                    name, data = None, []
                elif line.startswith(":"):
                    continue
                else:
                    field, _, value = line.partition(":")
                    value = value.removeprefix(" ")
                    if field == "event":
                        name = value
                    elif field == "data":
                        data.append(value)


def _raise_for(response: aiohttp.ClientResponse) -> None:
    if response.status == 401:
        response.release()
        raise VurioAuthError("Vurio refused the API token")
    if response.status == 403:
        response.release()
        raise VurioPermissionError("the API token lacks a permission this needs")
    if response.status >= 400:
        response.release()
        raise VurioError(f"Vurio answered {response.status}")


def rfc3339(moment: datetime) -> str:
    """A moment as Vurio's API reads it: UTC, whole seconds, with a Z."""
    return moment.astimezone(UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def parse_time(value: str) -> datetime:
    """A moment as Vurio's API writes it."""
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def rtsp_url(host: str, restream: dict[str, Any], camera: str) -> str:
    """Where Home Assistant's stream component plays a camera from."""
    username = quote(str(restream["username"]), safe="")
    password = quote(str(restream["password"]), safe="")
    return f"rtsp://{username}:{password}@{host}:{restream['port']}/{quote(camera)}"
