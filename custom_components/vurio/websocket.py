"""Home Assistant websocket commands the Vurio card calls.

Through Home Assistant's own connection and its user, so the card needs no
token of its own; the integration asks Vurio with the token it was set up with.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er

from .api import VurioError, VurioPermissionError, parse_time
from .const import DOMAIN, KINDS

# Said to the card when the token can watch and cannot read what it asked for.
NEEDS = (
    "The Vurio token needs events:read and recordings:read for events and the timeline. "
    "Make one in Vurio (Settings → API tokens, Home Assistant preset) and enter it under "
    "Settings → Devices & services → Vurio → Reconfigure."
)


def async_register(hass: HomeAssistant) -> None:
    """Once per Home Assistant."""
    key = f"{DOMAIN}_websocket"
    if hass.data.get(key):
        return
    hass.data[key] = True
    websocket_api.async_register_command(hass, cameras)
    websocket_api.async_register_command(hass, events)
    websocket_api.async_register_command(hass, timeline)


def _coordinator(hass: HomeAssistant, entry_id: str):
    entry = hass.config_entries.async_get_entry(entry_id)
    if entry is None or entry.domain != DOMAIN or not hasattr(entry, "runtime_data"):
        return None
    return entry.runtime_data


@websocket_api.websocket_command({vol.Required("type"): "vurio/cameras"})
@websocket_api.async_response
async def cameras(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Every Vurio camera, with the entities Home Assistant gave it."""
    registry = er.async_get(hass)
    found: list[dict[str, Any]] = []

    for entry in hass.config_entries.async_loaded_entries(DOMAIN):
        coordinator = entry.runtime_data
        installation = entry.unique_id or entry.entry_id
        for name, camera in coordinator.data.cameras.items():
            prefix = f"{installation}_{name}_"
            found.append(
                {
                    "entry_id": entry.entry_id,
                    "camera": name,
                    "display_name": camera.get("display_name") or name,
                    "entity_id": registry.async_get_entity_id("camera", DOMAIN, f"{prefix}camera"),
                    "online": bool(camera.get("online")),
                    "mode": camera.get("mode", "continuous"),
                    "recording": bool(camera.get("recording")),
                    "detection": bool(camera.get("detection")),
                    "sensors": camera.get("sensors", {}),
                    "sensor_entities": {
                        kind: entity
                        for kind in KINDS
                        if (entity := registry.async_get_entity_id("binary_sensor", DOMAIN, f"{prefix}{kind}"))
                    },
                }
            )

    connection.send_result(msg["id"], {"cameras": found})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "vurio/events",
        vol.Required("entry_id"): str,
        vol.Required("camera"): str,
        vol.Optional("limit", default=40): vol.All(int, vol.Range(min=1, max=200)),
    }
)
@websocket_api.async_response
async def events(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """A camera's newest events."""
    coordinator = _coordinator(hass, msg["entry_id"])
    if coordinator is None:
        connection.send_error(msg["id"], "not_found", "that Vurio installation is not loaded")
        return
    try:
        found = await coordinator.client.events(msg["camera"], msg["limit"])
    except VurioPermissionError:
        connection.send_error(msg["id"], "missing_permission", NEEDS)
        return
    except VurioError as err:
        connection.send_error(msg["id"], "vurio_error", str(err))
        return
    connection.send_result(msg["id"], {"events": found})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "vurio/timeline",
        vol.Required("entry_id"): str,
        vol.Required("cameras"): [str],
        vol.Required("from"): str,
        vol.Required("to"): str,
    }
)
@websocket_api.async_response
async def timeline(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Detections and recorded stretches between two moments."""
    coordinator = _coordinator(hass, msg["entry_id"])
    if coordinator is None:
        connection.send_error(msg["id"], "not_found", "that Vurio installation is not loaded")
        return
    try:
        start: datetime = parse_time(msg["from"])
        end: datetime = parse_time(msg["to"])
    except ValueError:
        connection.send_error(msg["id"], "invalid_format", "from and to are ISO 8601 moments")
        return
    try:
        answer = await coordinator.client.timeline(msg["cameras"], start, end)
    except VurioPermissionError:
        connection.send_error(msg["id"], "missing_permission", NEEDS)
        return
    except VurioError as err:
        connection.send_error(msg["id"], "vurio_error", str(err))
        return
    connection.send_result(msg["id"], answer)
