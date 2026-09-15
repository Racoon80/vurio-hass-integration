"""What the Vurio card needs from the integration."""

from __future__ import annotations

from http import HTTPStatus

from homeassistant.core import HomeAssistant
from homeassistant.setup import async_setup_component
from pytest_homeassistant_custom_component.common import MockConfigEntry
from pytest_homeassistant_custom_component.test_util.aiohttp import AiohttpClientMocker
from pytest_homeassistant_custom_component.typing import ClientSessionGenerator, WebSocketGenerator

from .conftest import URL, camera, integration

TIMELINE = {
    "cameras": ["garden"],
    "detections": [
        {"camera": "garden", "group": "person", "started_at": "2026-09-15T11:00:00Z", "ended_at": "2026-09-15T11:01:00Z"}
    ],
    "recorded": [{"from": "2026-09-15T10:00:00Z", "to": "2026-09-15T12:00:00Z"}],
}


async def set_up(hass: HomeAssistant, entry: MockConfigEntry, aioclient_mock: AiohttpClientMocker) -> None:
    aioclient_mock.get(f"{URL}/api/integration", json=integration(camera(), camera("cave")))
    aioclient_mock.get(f"{URL}/api/integration/stream", text="")
    assert await async_setup_component(hass, "http", {})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()


async def test_the_card_learns_each_camera_with_its_entities(
    hass: HomeAssistant,
    entry: MockConfigEntry,
    aioclient_mock: AiohttpClientMocker,
    hass_ws_client: WebSocketGenerator,
) -> None:
    await set_up(hass, entry, aioclient_mock)
    client = await hass_ws_client(hass)

    await client.send_json_auto_id({"type": "vurio/cameras"})
    answer = await client.receive_json()

    assert answer["success"]
    garden = next(c for c in answer["result"]["cameras"] if c["camera"] == "garden")
    assert garden["entry_id"] == entry.entry_id
    assert garden["entity_id"] == "camera.garden"
    assert garden["sensor_entities"]["person"] == "binary_sensor.garden_person"
    assert garden["mode"] == "events"

    assert await hass.config_entries.async_unload(entry.entry_id)


async def test_events_and_the_timeline_come_through_home_assistant(
    hass: HomeAssistant,
    entry: MockConfigEntry,
    aioclient_mock: AiohttpClientMocker,
    hass_ws_client: WebSocketGenerator,
) -> None:
    await set_up(hass, entry, aioclient_mock)
    aioclient_mock.get(f"{URL}/api/events/recent", json={"events": [{"id": "e1", "camera": "garden", "kind": "object", "label": "person", "started_at": "2026-09-15T11:00:00Z", "ended_at": None}], "next": None})
    aioclient_mock.get(f"{URL}/api/events/timeline", json=TIMELINE)
    client = await hass_ws_client(hass)

    await client.send_json_auto_id({"type": "vurio/events", "entry_id": entry.entry_id, "camera": "garden", "limit": 5})
    events = await client.receive_json()
    assert events["success"] and events["result"]["events"][0]["id"] == "e1"

    await client.send_json_auto_id(
        {"type": "vurio/timeline", "entry_id": entry.entry_id, "cameras": ["garden"], "from": "2026-09-15T10:00:00Z", "to": "2026-09-15T12:00:00Z"}
    )
    timeline = await client.receive_json()
    assert timeline["success"] and timeline["result"]["detections"][0]["group"] == "person"
    asked = [call for call in aioclient_mock.mock_calls if "/api/events/timeline" in str(call[1])]
    assert "cameras=garden" in str(asked[0][1])

    await client.send_json_auto_id({"type": "vurio/events", "entry_id": "nope", "camera": "garden"})
    missing = await client.receive_json()
    assert not missing["success"] and missing["error"]["code"] == "not_found"

    assert await hass.config_entries.async_unload(entry.entry_id)


async def test_a_watch_only_token_gets_a_sentence_about_what_it_lacks(
    hass: HomeAssistant,
    entry: MockConfigEntry,
    aioclient_mock: AiohttpClientMocker,
    hass_ws_client: WebSocketGenerator,
) -> None:
    await set_up(hass, entry, aioclient_mock)
    aioclient_mock.get(f"{URL}/api/events/recent", status=403)
    client = await hass_ws_client(hass)

    await client.send_json_auto_id({"type": "vurio/events", "entry_id": entry.entry_id, "camera": "garden"})
    answer = await client.receive_json()

    assert not answer["success"]
    assert answer["error"]["code"] == "missing_permission"
    assert "events:read" in answer["error"]["message"]

    assert await hass.config_entries.async_unload(entry.entry_id)


async def test_the_card_is_served_and_the_live_view_refuses_what_it_should(
    hass: HomeAssistant,
    entry: MockConfigEntry,
    aioclient_mock: AiohttpClientMocker,
    hass_client: ClientSessionGenerator,
) -> None:
    await set_up(hass, entry, aioclient_mock)
    web = await hass_client()

    card = await web.get("/vurio_static/vurio-card.js")
    assert card.status == HTTPStatus.OK
    assert "vurio-card" in await card.text()

    unknown = await web.get(f"/api/vurio/not-an-entry/live/garden/ws")
    assert unknown.status == HTTPStatus.NOT_FOUND
    wrong = await web.get(f"/api/vurio/{entry.entry_id}/live/garden/ws?quality=4k")
    assert wrong.status == HTTPStatus.BAD_REQUEST

    assert await hass.config_entries.async_unload(entry.entry_id)
