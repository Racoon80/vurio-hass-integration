"""Home Assistant's own addresses for Vurio's footage and pictures.

A browser playing a clip or showing a thumbnail cannot hold Vurio's API token,
and must not. These views are behind Home Assistant's authentication — the
media browser hands out signed paths to them — and ask Vurio on its behalf with
the integration's token.
"""

from __future__ import annotations

from datetime import UTC, datetime

from aiohttp import web

from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant

from .api import VurioClient, VurioError
from .const import DOMAIN

# The same bound Vurio sets; asking for more is refused there anyway.
MAX_CLIP_SECONDS = 300

CHUNK = 64 * 1024


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

        try:
            upstream = await client.clip(
                camera,
                datetime.fromtimestamp(begins, UTC),
                datetime.fromtimestamp(ends, UTC),
            )
        except VurioError as err:
            raise web.HTTPNotFound from err

        try:
            headers = {"Content-Type": "video/mp4", "Cache-Control": "no-store"}
            if length := upstream.headers.get("Content-Length"):
                headers["Content-Length"] = length
            response = web.StreamResponse(headers=headers)
            await response.prepare(request)
            async for chunk in upstream.content.iter_chunked(CHUNK):
                await response.write(chunk)
            await response.write_eof()
            return response
        finally:
            upstream.release()


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


def register(hass: HomeAssistant) -> None:
    """Once per Home Assistant, however many installations are added."""
    key = f"{DOMAIN}_views"
    if hass.data.get(key):
        return
    hass.http.register_view(VurioClipView(hass))
    hass.http.register_view(VurioFrameView(hass))
    hass.data[key] = True
