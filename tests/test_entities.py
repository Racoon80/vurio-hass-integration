"""A camera's device and what it shows."""

from __future__ import annotations

import asyncio
from unittest.mock import patch

import aiohttp
from homeassistant.components.camera import async_get_stream_source
from homeassistant.const import STATE_OFF, STATE_ON
from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr
from homeassistant.setup import async_setup_component
from pytest_homeassistant_custom_component.common import MockConfigEntry
from pytest_homeassistant_custom_component.test_util.aiohttp import AiohttpClientMocker

from custom_components.vurio.api import rtsp_url
from custom_components.vurio.const import DOMAIN

from .conftest import URL, camera, integration, sse


async def until(condition, seconds: float = 5) -> None:
    """Wait for something a background task does, or fail rather than hang."""
    for _ in range(int(seconds / 0.01)):
        if condition():
            return
        await asyncio.sleep(0.01)
    raise AssertionError("it never happened")


async def set_up(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()


async def test_a_camera_is_a_device_with_its_sensors_switches_and_stream(
    hass: HomeAssistant, entry: MockConfigEntry, aioclient_mock: AiohttpClientMocker
) -> None:
    aioclient_mock.get(f"{URL}/api/integration", json=integration())
    aioclient_mock.get(f"{URL}/api/integration/stream", text="")

    await set_up(hass, entry)

    assert hass.states.get("camera.garden") is not None
    assert hass.states.get("binary_sensor.garden_person").state == STATE_OFF
    assert hass.states.get("binary_sensor.garden_recording").state == STATE_ON
    assert hass.states.get("sensor.garden_schedule").state == "events"
    assert hass.states.get("switch.garden_record").state == STATE_ON
    assert hass.states.get("switch.garden_detect").state == STATE_ON

    source = await async_get_stream_source(hass, "camera.garden")
    assert source == "rtsp://vurio:s3cret%2F%2B@vurio.local:8556/garden"

    assert await hass.config_entries.async_unload(entry.entry_id)


async def test_the_event_stream_turns_a_sensor_on_and_changes_a_camera(
    hass: HomeAssistant, entry: MockConfigEntry, aioclient_mock: AiohttpClientMocker
) -> None:
    aioclient_mock.get(f"{URL}/api/integration", json=integration())
    aioclient_mock.get(
        f"{URL}/api/integration/stream",
        text=sse(
            ("cameras", [camera()]),
            ("sensor", {"camera": "garden", "kind": "person", "on": True}),
            # Vurio's `changed` carries the sensors as they are, so the person
            # it has just reported is still there.
            (
                "changed",
                [
                    camera(
                        mode="off",
                        online=False,
                        sensors={"motion": False, "person": True, "vehicle": False, "animal": False},
                    )
                ],
            ),
            ("sensor", {"camera": "elsewhere", "kind": "person", "on": True}),
        ),
    )

    await set_up(hass, entry)
    # The stream is a background task, which Home Assistant does not wait for.
    await until(lambda: hass.states.get("sensor.garden_schedule").state == "off")

    assert hass.states.get("binary_sensor.garden_person").state == STATE_ON
    assert hass.states.get("sensor.garden_schedule").state == "off"
    assert hass.states.get("binary_sensor.garden_recording").state == STATE_OFF

    assert await hass.config_entries.async_unload(entry.entry_id)


async def test_a_stream_that_breaks_off_is_opened_again(
    hass: HomeAssistant, entry: MockConfigEntry, aioclient_mock: AiohttpClientMocker
) -> None:
    aioclient_mock.get(f"{URL}/api/integration", json=integration())
    opened = 0

    async def breaking_off_then_telling(self):
        nonlocal opened
        opened += 1
        if opened == 1:
            # An error the loop did not name used to end it for good, and the
            # sensors never moved again until Home Assistant restarted.
            raise aiohttp.ClientPayloadError("Response payload is not completed")
        yield "sensor", {"camera": "garden", "kind": "person", "on": True}

    with patch("custom_components.vurio.api.VurioClient.stream", breaking_off_then_telling):
        await set_up(hass, entry)
        await until(lambda: hass.states.get("binary_sensor.garden_person").state == STATE_ON)

    assert opened >= 2
    assert await hass.config_entries.async_unload(entry.entry_id)


async def test_a_camera_the_token_may_not_manage_has_no_switches_and_no_restream_no_stream(
    hass: HomeAssistant, entry: MockConfigEntry, aioclient_mock: AiohttpClientMocker
) -> None:
    aioclient_mock.get(
        f"{URL}/api/integration",
        json=integration(camera(switchable=False), restream=False),
    )
    aioclient_mock.get(f"{URL}/api/integration/stream", text="")

    await set_up(hass, entry)

    assert hass.states.get("switch.garden_record") is None
    assert hass.states.get("binary_sensor.garden_motion") is not None
    assert await async_get_stream_source(hass, "camera.garden") is None

    assert await hass.config_entries.async_unload(entry.entry_id)


async def test_a_switch_asks_vurio_and_shows_the_change_at_once(
    hass: HomeAssistant, entry: MockConfigEntry, aioclient_mock: AiohttpClientMocker
) -> None:
    aioclient_mock.get(f"{URL}/api/integration", json=integration())
    aioclient_mock.get(f"{URL}/api/integration/stream", text="")
    aioclient_mock.put(f"{URL}/api/cameras/garden/detection", json={"name": "garden"})

    await set_up(hass, entry)

    await hass.services.async_call(
        "switch", "turn_off", {"entity_id": "switch.garden_detect"}, blocking=True
    )

    put = [call for call in aioclient_mock.mock_calls if call[0] == "PUT"]
    assert put and put[0][2] == {"enabled": False}
    assert hass.states.get("switch.garden_detect").state == STATE_OFF

    assert await hass.config_entries.async_unload(entry.entry_id)


def test_the_stream_address_escapes_the_login() -> None:
    assert (
        rtsp_url("10.0.0.2", {"port": 8556, "username": "a b", "password": "p@ss:w/rd"}, "cave")
        == "rtsp://a%20b:p%40ss%3Aw%2Frd@10.0.0.2:8556/cave"
    )


async def test_a_camera_vurio_no_longer_has_can_be_removed_but_a_current_one_cannot(
    hass: HomeAssistant,
    entry: MockConfigEntry,
    aioclient_mock: AiohttpClientMocker,
    hass_ws_client,
) -> None:
    aioclient_mock.get(f"{URL}/api/integration", json=integration(camera("garden")))
    aioclient_mock.get(f"{URL}/api/integration/stream", text="")
    await set_up(hass, entry)

    registry = dr.async_get(hass)
    gone = registry.async_get_or_create(
        config_entry_id=entry.entry_id, identifiers={(DOMAIN, f"{entry.unique_id}_shed")}
    )
    (garden,) = [
        device
        for device in dr.async_entries_for_config_entry(registry, entry.entry_id)
        if (DOMAIN, f"{entry.unique_id}_garden") in device.identifiers
    ]

    assert await async_setup_component(hass, "config", {})
    client = await hass_ws_client(hass)

    for device, removable in ((gone, True), (garden, False)):
        await client.send_json_auto_id(
            {
                "type": "config/device_registry/remove_config_entry",
                "device_id": device.id,
                "config_entry_id": entry.entry_id,
            }
        )
        response = await client.receive_json()
        assert response["success"] is removable

    assert registry.async_get(gone.id) is None
    assert registry.async_get(garden.id) is not None

    assert await hass.config_entries.async_unload(entry.entry_id)
