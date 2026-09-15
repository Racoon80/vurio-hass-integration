"""Vurio's events and recordings in Home Assistant's media browser.

    Vurio (one folder per installation when there are several)
    └── Garden
        ├── Events            the newest events, each a clip from just before
        │                     it began to just after it ended
        └── Recordings
            └── Monday 15 September
                └── 14:00     that hour's recorded stretches, five minutes each

Identifiers are paths: `<entry>/<camera>/events`, `<entry>/<camera>/recordings`,
`<entry>/<camera>/day/<unix midnight>`, `<entry>/<camera>/hour/<unix hour>`, and a
playable `<entry>/<camera>/clip/<unix start>/<unix end>`.
"""

from __future__ import annotations

from datetime import UTC, datetime, timedelta

from homeassistant.components.http.auth import async_sign_path
from homeassistant.components.media_player import BrowseError, MediaClass, MediaType
from homeassistant.components.media_source import (
    BrowseMediaSource,
    MediaSource,
    MediaSourceItem,
    PlayMedia,
    Unresolvable,
)
from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util

from .api import VurioClient, VurioError, parse_time
from .const import DOMAIN

# How far back the recordings folder offers days.
DAYS = 7

# How many events a camera's folder lists.
EVENTS = 50

# Footage either side of an event, so its clip shows the moment it began.
PADDING = timedelta(seconds=5)

# One clip, and the most Vurio plays as one file.
CLIP = timedelta(minutes=5)

# How long a thumbnail address stays valid.
THUMBNAIL_EXPIRY = timedelta(hours=1)


async def async_get_media_source(hass: HomeAssistant) -> MediaSource:
    return VurioMediaSource(hass)


def folder(identifier: str, title: str, children: list[BrowseMediaSource] | None = None) -> BrowseMediaSource:
    return BrowseMediaSource(
        domain=DOMAIN,
        identifier=identifier,
        media_class=MediaClass.DIRECTORY,
        media_content_type=MediaType.VIDEO,
        title=title,
        can_play=False,
        can_expand=True,
        children=children,
        children_media_class=MediaClass.VIDEO if children and not children[0].can_expand else MediaClass.DIRECTORY,
    )


def clip(
    entry_id: str, camera: str, start: datetime, end: datetime, title: str, thumbnail: str | None = None
) -> BrowseMediaSource:
    return BrowseMediaSource(
        domain=DOMAIN,
        identifier=f"{entry_id}/{camera}/clip/{int(start.timestamp())}/{int(end.timestamp())}",
        media_class=MediaClass.VIDEO,
        media_content_type=MediaType.VIDEO,
        title=title,
        can_play=True,
        can_expand=False,
        thumbnail=thumbnail,
    )


def event_range(event: dict) -> tuple[datetime, datetime]:
    """From just before an event began to just after it ended, at most one clip long."""
    start = parse_time(event["started_at"]) - PADDING
    ended = parse_time(event["ended_at"]) if event.get("ended_at") else dt_util.utcnow()
    return start, min(ended + PADDING, start + CLIP)


def stretches(covered: list[dict[str, str]], start: datetime, end: datetime) -> list[tuple[datetime, datetime]]:
    """What was recorded in [start, end), cut into clips."""
    pieces: list[tuple[datetime, datetime]] = []
    for run in covered:
        begins = max(parse_time(run["from"]), start)
        ends = min(parse_time(run["to"]), end)
        while begins < ends:
            pieces.append((begins, min(begins + CLIP, ends)))
            begins += CLIP
    return pieces


class VurioMediaSource(MediaSource):
    """Every added Vurio installation's footage."""

    name = "Vurio"

    def __init__(self, hass: HomeAssistant) -> None:
        super().__init__(DOMAIN)
        self.hass = hass

    def _installations(self) -> dict[str, tuple[str, VurioClient, dict]]:
        found = {}
        for entry in self.hass.config_entries.async_loaded_entries(DOMAIN):
            coordinator = entry.runtime_data
            found[entry.entry_id] = (entry.title, coordinator.client, coordinator.data.cameras)
        return found

    async def async_resolve_media(self, item: MediaSourceItem) -> PlayMedia:
        parts = (item.identifier or "").split("/")
        if len(parts) != 5 or parts[2] != "clip":
            raise Unresolvable(f"{item.identifier} is not a clip")
        entry_id, camera, _, start, end = parts
        if entry_id not in self._installations():
            raise Unresolvable("that Vurio installation is not loaded")
        return PlayMedia(f"/api/vurio/{entry_id}/clip/{camera}/{start}/{end}", "video/mp4")

    async def async_browse_media(self, item: MediaSourceItem) -> BrowseMediaSource:
        installations = self._installations()
        parts = [part for part in (item.identifier or "").split("/") if part]

        if not parts:
            if len(installations) == 1:
                entry_id = next(iter(installations))
                return self._cameras(entry_id, installations[entry_id], identifier="", title="Vurio")
            return folder(
                "",
                "Vurio",
                [folder(entry_id, title) for entry_id, (title, _, _) in installations.items()],
            )

        entry_id = parts[0]
        if entry_id not in installations:
            raise BrowseError("that Vurio installation is not loaded")
        title, client, cameras = installations[entry_id]

        if len(parts) == 1:
            return self._cameras(entry_id, installations[entry_id], identifier=entry_id, title=title)

        camera = parts[1]
        if camera not in cameras:
            raise BrowseError(f"there is no camera {camera}")
        name = cameras[camera].get("display_name") or camera
        base = f"{entry_id}/{camera}"

        try:
            if len(parts) == 2:
                return folder(
                    base,
                    name,
                    [folder(f"{base}/events", "Events"), folder(f"{base}/recordings", "Recordings")],
                )
            if parts[2] == "events":
                return await self._events(entry_id, client, camera, name)
            if parts[2] == "recordings":
                return self._days(base, name)
            if parts[2] == "day" and len(parts) == 4:
                return await self._hours(client, base, camera, int(parts[3]))
            if parts[2] == "hour" and len(parts) == 4:
                return await self._clips(entry_id, client, base, camera, int(parts[3]))
        except VurioError as err:
            raise BrowseError(f"Vurio did not answer: {err}") from err
        except ValueError as err:
            raise BrowseError(f"{item.identifier} is not a folder") from err

        raise BrowseError(f"{item.identifier} is not a folder")

    def _cameras(self, entry_id: str, installation: tuple, identifier: str, title: str) -> BrowseMediaSource:
        _, _, cameras = installation
        return folder(
            identifier,
            title,
            [
                folder(f"{entry_id}/{name}", camera.get("display_name") or name)
                for name, camera in sorted(cameras.items())
            ],
        )

    async def _events(self, entry_id: str, client: VurioClient, camera: str, name: str) -> BrowseMediaSource:
        children = []
        for event in await client.events(camera, EVENTS):
            start, end = event_range(event)
            when = dt_util.as_local(parse_time(event["started_at"]))
            what = str(event.get("label") or event.get("kind") or "event").capitalize()
            thumbnail = async_sign_path(
                self.hass, f"/api/vurio/{entry_id}/frame/{event['id']}", THUMBNAIL_EXPIRY
            )
            children.append(
                clip(entry_id, camera, start, end, f"{what} · {when:%a %d %b %H:%M:%S}", thumbnail)
            )
        return folder(f"{entry_id}/{camera}/events", f"{name} · Events", children)

    def _days(self, base: str, name: str) -> BrowseMediaSource:
        today = dt_util.start_of_local_day()
        children = []
        for back in range(DAYS):
            day = today - timedelta(days=back)
            children.append(folder(f"{base}/day/{int(day.timestamp())}", f"{day:%A %d %B}"))
        return folder(f"{base}/recordings", f"{name} · Recordings", children)

    async def _hours(self, client: VurioClient, base: str, camera: str, midnight: int) -> BrowseMediaSource:
        day = dt_util.as_local(datetime.fromtimestamp(midnight, UTC))
        covered = await client.coverage(camera, day, day + timedelta(days=1))
        children = []
        for hour in range(24):
            begins = day + timedelta(hours=hour)
            if stretches(covered, begins, begins + timedelta(hours=1)):
                children.append(folder(f"{base}/hour/{int(begins.timestamp())}", f"{begins:%H:00}"))
        return folder(f"{base}/day/{midnight}", f"{day:%A %d %B}", children)

    async def _clips(
        self, entry_id: str, client: VurioClient, base: str, camera: str, hour: int
    ) -> BrowseMediaSource:
        begins = dt_util.as_local(datetime.fromtimestamp(hour, UTC))
        ends = begins + timedelta(hours=1)
        covered = await client.coverage(camera, begins, ends)
        children = [
            clip(entry_id, camera, start, end, f"{dt_util.as_local(start):%H:%M}–{dt_util.as_local(end):%H:%M}")
            for start, end in stretches(covered, begins, ends)
        ]
        return folder(f"{base}/hour/{hour}", f"{begins:%A %d %B %H:00}", children)
