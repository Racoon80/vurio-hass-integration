"""Shared fixtures: a Vurio installation that answers from memory."""

from __future__ import annotations

import json
from typing import Any

import pytest

from homeassistant.const import CONF_TOKEN, CONF_URL, CONF_VERIFY_SSL
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.vurio.const import DOMAIN

pytest_plugins = "pytest_homeassistant_custom_component"

URL = "http://vurio.local:8099"

ME = {
    "username": "home-assistant",
    "kind": "token",
    "permissions": ["cameras:manage", "events:read", "live:view", "recordings:read"],
    "cameras": {"kind": "all"},
    "must_change_password": False,
}


def camera(name: str = "garden", **changes: Any) -> dict[str, Any]:
    return {
        "name": name,
        "display_name": name.capitalize(),
        "online": True,
        "mode": "events",
        "recording": True,
        "detection": True,
        "switchable": True,
        "sensors": {"motion": False, "person": False, "vehicle": False, "animal": False},
        **changes,
    }


def integration(*cameras: dict[str, Any], restream: bool = True) -> dict[str, Any]:
    return {
        "version": "0.0.1",
        "restream": (
            {"port": 8556, "username": "vurio", "password": "s3cret/+"} if restream else None
        ),
        "cameras": list(cameras) or [camera()],
    }


def sse(*events: tuple[str, Any]) -> str:
    return "".join(f": keep-alive\n\nevent: {name}\ndata: {json.dumps(data)}\n\n" for name, data in events)


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    yield


@pytest.fixture
def entry() -> MockConfigEntry:
    return MockConfigEntry(
        domain=DOMAIN,
        title="Vurio (vurio.local)",
        unique_id=URL,
        data={CONF_URL: URL, CONF_TOKEN: "token", CONF_VERIFY_SSL: True},
    )
