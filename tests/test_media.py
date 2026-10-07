"""Events and recordings in the media browser."""

from __future__ import annotations

from datetime import UTC, datetime, timedelta
from http import HTTPStatus

from homeassistant.components import media_source
from homeassistant.core import HomeAssistant
from homeassistant.setup import async_setup_component
from pytest_homeassistant_custom_component.common import MockConfigEntry
from pytest_homeassistant_custom_component.test_util.aiohttp import AiohttpClientMocker
from pytest_homeassistant_custom_component.typing import ClientSessionGenerator

from custom_components.vurio.media_source import event_range, stretches

from .conftest import URL, integration

EVENT = {
    "id": "0b9c1f1e-7b0e-4a55-9b39-2a3b1a0c9d11",
    "camera": "garden",
    "kind": "object",
    "label": "person",
    "started_at": "2026-09-15T12:00:10Z",
    "ended_at": "2026-09-15T12:00:40Z",
}


async def set_up(hass: HomeAssistant, entry: MockConfigEntry, aioclient_mock: AiohttpClientMocker) -> None:
    aioclient_mock.get(f"{URL}/api/integration", json=integration())
    aioclient_mock.get(f"{URL}/api/integration/stream", text="")
    assert await async_setup_component(hass, "http", {})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()


async def test_a_camera_folder_holds_its_events_and_recordings(
    hass: HomeAssistant, entry: MockConfigEntry, aioclient_mock: AiohttpClientMocker
) -> None:
    await set_up(hass, entry, aioclient_mock)
    aioclient_mock.get(f"{URL}/api/events/recent", json={"events": [EVENT], "next": None})

    root = await media_source.async_browse_media(hass, "media-source://vurio")
    assert [child.title for child in root.children] == ["Garden"]

    garden = await media_source.async_browse_media(hass, root.children[0].media_content_id)
    assert [child.title for child in garden.children] == ["Events", "Recordings"]

    events = await media_source.async_browse_media(hass, garden.children[0].media_content_id)
    assert len(events.children) == 1
    assert events.children[0].title.startswith("Person · ")
    assert events.children[0].can_play
    assert f"/api/vurio/{entry.entry_id}/frame/{EVENT['id']}" in events.children[0].thumbnail

    played = await media_source.async_resolve_media(
        hass, events.children[0].media_content_id, None
    )
    assert played.mime_type == "video/mp4"
    assert played.url.startswith(f"/api/vurio/{entry.entry_id}/clip/garden/")

    assert await hass.config_entries.async_unload(entry.entry_id)


async def test_the_clip_view_plays_what_vurio_assembles_and_refuses_too_much(
    hass: HomeAssistant,
    entry: MockConfigEntry,
    aioclient_mock: AiohttpClientMocker,
    hass_client: ClientSessionGenerator,
) -> None:
    await set_up(hass, entry, aioclient_mock)
    aioclient_mock.get(f"{URL}/api/recordings/clip", content=b"\x00\x00\x00\x18ftypmp42")

    client = await hass_client()
    start = int(datetime(2026, 9, 15, 12, tzinfo=UTC).timestamp())

    played = await client.get(f"/api/vurio/{entry.entry_id}/clip/garden/{start}/{start + 60}")
    assert played.status == HTTPStatus.OK
    assert await played.read() == b"\x00\x00\x00\x18ftypmp42"
    asked = [call for call in aioclient_mock.mock_calls if "/api/recordings/clip" in str(call[1])]
    assert "from=2026-09-15T12:00:00Z" in str(asked[0][1])

    too_long = await client.get(f"/api/vurio/{entry.entry_id}/clip/garden/{start}/{start + 3600}")
    assert too_long.status == HTTPStatus.BAD_REQUEST

    nobody = await client.get(f"/api/vurio/not-an-entry/clip/garden/{start}/{start + 60}")
    assert nobody.status == HTTPStatus.NOT_FOUND

    assert await hass.config_entries.async_unload(entry.entry_id)


async def test_a_clip_answers_byte_ranges_so_the_player_can_jump_ahead(
    hass: HomeAssistant,
    entry: MockConfigEntry,
    aioclient_mock: AiohttpClientMocker,
    hass_client: ClientSessionGenerator,
) -> None:
    await set_up(hass, entry, aioclient_mock)
    footage = bytes(range(256)) * 64
    aioclient_mock.get(f"{URL}/api/recordings/clip", content=footage)

    client = await hass_client()
    start = int(datetime(2026, 9, 16, 12, tzinfo=UTC).timestamp())
    path = f"/api/vurio/{entry.entry_id}/clip/garden/{start}/{start + 120}"

    whole = await client.get(path)
    assert whole.status == HTTPStatus.OK
    assert whole.headers["Accept-Ranges"] == "bytes"
    assert await whole.read() == footage

    later = await client.get(path, headers={"Range": "bytes=10000-10099"})
    assert later.status == HTTPStatus.PARTIAL_CONTENT
    assert await later.read() == footage[10000:10100]

    # Vurio assembled it once; the jump was answered from what was kept.
    asked = [call for call in aioclient_mock.mock_calls if "/api/recordings/clip" in str(call[1])]
    assert len(asked) == 1

    assert await hass.config_entries.async_unload(entry.entry_id)


def test_an_event_clip_starts_before_the_event_and_is_never_longer_than_one_clip() -> None:
    start, end = event_range(EVENT)
    assert start == datetime(2026, 9, 15, 12, 0, 5, tzinfo=UTC)
    assert end == datetime(2026, 9, 15, 12, 0, 45, tzinfo=UTC)

    long = {**EVENT, "ended_at": "2026-09-15T13:00:00Z"}
    start, end = event_range(long)
    assert end - start == timedelta(minutes=5)


def test_recorded_stretches_are_cut_into_clips_within_the_hour() -> None:
    hour = datetime(2026, 9, 15, 12, tzinfo=UTC)
    covered = [
        {"from": "2026-09-15T11:50:00Z", "to": "2026-09-15T12:12:00Z"},
        {"from": "2026-09-15T12:40:00Z", "to": "2026-09-15T12:43:00Z"},
    ]

    pieces = stretches(covered, hour, hour + timedelta(hours=1))

    assert [(a.minute, b.minute) for a, b in pieces] == [(0, 5), (5, 10), (10, 12), (40, 43)]
