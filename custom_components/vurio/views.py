"""Home Assistant's own addresses for Vurio's footage and pictures.

A browser playing a clip or showing a thumbnail cannot hold Vurio's API token,
and must not. These views are behind Home Assistant's authentication — the
media browser hands out signed paths to them — and ask Vurio on its behalf with
the integration's token.
"""

from __future__ import annotations

import asyncio
import hashlib
import tempfile
import time
from datetime import UTC, datetime
from pathlib import Path

import aiohttp
from aiohttp import web

from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant

from .api import VurioClient, VurioError
from .const import DOMAIN

# The same bound Vurio sets; asking for more is refused there anyway.
MAX_CLIP_SECONDS = 300

CHUNK = 64 * 1024

# Where clips wait for the player's next request. A browser only lets someone
# jump to a later moment in a video when the server answers byte ranges, and
# Vurio assembles a clip anew on every request, so answering ranges means
# keeping the clip for a while. Without this, a click at one minute in a clip
# playing at ten seconds did nothing (2026-10-07).
CLIPS = Path(tempfile.gettempdir()) / "vurio-clips"
# A few clips, a little while: a player asks again as it seeks, nobody after.
KEEP_CLIPS = 6
KEEP_FOR = 15 * 60

_making: dict[str, asyncio.Lock] = {}


def client_for(hass: HomeAssistant, entry_id: str) -> VurioClient | None:
    entry = hass.config_entries.async_get_entry(entry_id)
    if entry is None or entry.domain != DOMAIN or not hasattr(entry, "runtime_data"):
        return None
    coordinator = getattr(entry, "runtime_data", None)
    return getattr(coordinator, "client", None)


class VurioClipView(HomeAssistantView):
    """A few minutes of one camera's footage, as one mp4."""

    url = "/api/vurio/{entry_id}/clip/{camera}/{start}/{end}"
    name = "api:vurio:clip"
    requires_auth = True

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass

    async def get(
        self, request: web.Request, entry_id: str, camera: str, start: str, end: str
    ) -> web.StreamResponse:
        client = client_for(self.hass, entry_id)
        if client is None:
            raise web.HTTPNotFound

        try:
            begins, ends = int(start), int(end)
        except ValueError as err:
            raise web.HTTPBadRequest from err

        if not 0 < ends - begins <= MAX_CLIP_SECONDS:
            raise web.HTTPBadRequest

        name = hashlib.sha256(f"{entry_id}/{camera}/{begins}/{ends}".encode()).hexdigest()[:32]
        kept = CLIPS / f"{name}.mp4"

        # One fetch per clip, however many range requests arrive at once.
        async with _making.setdefault(name, asyncio.Lock()):
            if not await self.hass.async_add_executor_job(_fresh, kept):
                await self._fetch(client, camera, begins, ends, kept)

        # FileResponse answers Range and says Accept-Ranges, which is what lets
        # the player seek.
        return web.FileResponse(kept, headers={"Content-Type": "video/mp4", "Cache-Control": "no-store"})

    async def _fetch(self, client: VurioClient, camera: str, begins: int, ends: int, kept: Path) -> None:
        try:
            upstream = await client.clip(
                camera,
                datetime.fromtimestamp(begins, UTC),
                datetime.fromtimestamp(ends, UTC),
            )
        except VurioError as err:
            raise web.HTTPNotFound from err

        part = kept.with_suffix(".part")
        try:
            handle = await self.hass.async_add_executor_job(_open, part)
            try:
                async for chunk in upstream.content.iter_chunked(CHUNK):
                    await self.hass.async_add_executor_job(handle.write, chunk)
            finally:
                await self.hass.async_add_executor_job(handle.close)
            await self.hass.async_add_executor_job(part.replace, kept)
        except BaseException:
            await self.hass.async_add_executor_job(lambda: part.unlink(missing_ok=True))
            raise
        finally:
            upstream.release()

        await self.hass.async_add_executor_job(_sweep, kept)


def _open(path: Path):
    path.parent.mkdir(mode=0o700, parents=True, exist_ok=True)
    return path.open("wb")


def _fresh(path: Path) -> bool:
    try:
        return time.time() - path.stat().st_mtime < KEEP_FOR
    except FileNotFoundError:
        return False


def _sweep(keep: Path) -> None:
    """Drop clips past their time, and the oldest beyond a handful."""
    try:
        clips = sorted(CLIPS.glob("*.mp4"), key=lambda clip: clip.stat().st_mtime, reverse=True)
    except FileNotFoundError:
        return
    for index, clip in enumerate(clips):
        if clip != keep and (index >= KEEP_CLIPS or not _fresh(clip)):
            clip.unlink(missing_ok=True)


class VurioFrameView(HomeAssistantView):
    """The picture from the moment of an event, for the media browser's thumbnails."""

    url = "/api/vurio/{entry_id}/frame/{event_id}"
    name = "api:vurio:frame"
    requires_auth = True

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass

    async def get(self, request: web.Request, entry_id: str, event_id: str) -> web.Response:
        client = client_for(self.hass, entry_id)
        if client is None:
            raise web.HTTPNotFound

        picture = await client.event_frame(event_id, 320)
        if picture is None:
            raise web.HTTPNotFound

        return web.Response(
            body=picture, content_type="image/jpeg", headers={"Cache-Control": "private, max-age=3600"}
        )


QUALITIES = ("main", "sub")


class VurioLiveView(HomeAssistantView):
    """A camera's live websocket, carried between the browser and Vurio.

    Frames are passed on as they are — Vurio's go2rtc speaks MSE and WebRTC
    signalling over the same socket, and nothing here needs to understand
    either. The browser reaches it with a signed path, which is how an element
    that cannot send a header authenticates to Home Assistant.
    """

    url = "/api/vurio/{entry_id}/live/{camera}/ws"
    name = "api:vurio:live"
    requires_auth = True

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass

    async def get(self, request: web.Request, entry_id: str, camera: str) -> web.StreamResponse:
        client = client_for(self.hass, entry_id)
        if client is None:
            raise web.HTTPNotFound

        quality = request.query.get("quality", "sub")
        if quality not in QUALITIES:
            raise web.HTTPBadRequest

        try:
            upstream = await client.live_socket(camera, quality)
        except VurioError as err:
            raise web.HTTPServiceUnavailable(text=str(err)) from err

        browser = web.WebSocketResponse(heartbeat=30, max_msg_size=0)
        await browser.prepare(request)

        async def carry(source, target) -> None:
            async for message in source:
                if message.type == aiohttp.WSMsgType.TEXT:
                    await target.send_str(message.data)
                elif message.type == aiohttp.WSMsgType.BINARY:
                    await target.send_bytes(message.data)
                else:
                    break

        both = [
            asyncio.ensure_future(carry(browser, upstream)),
            asyncio.ensure_future(carry(upstream, browser)),
        ]
        try:
            await asyncio.wait(both, return_when=asyncio.FIRST_COMPLETED)
        except (aiohttp.ClientError, ConnectionResetError):
            pass
        finally:
            for task in both:
                task.cancel()
            await upstream.close()
            await browser.close()

        return browser


def register(hass: HomeAssistant) -> None:
    """Once per Home Assistant, however many installations are added."""
    key = f"{DOMAIN}_views"
    if hass.data.get(key):
        return
    hass.http.register_view(VurioClipView(hass))
    hass.http.register_view(VurioFrameView(hass))
    hass.http.register_view(VurioLiveView(hass))
    hass.data[key] = True
