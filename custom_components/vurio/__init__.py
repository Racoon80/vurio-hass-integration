"""Vurio, the video recorder, in Home Assistant."""

from __future__ import annotations

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_TOKEN, CONF_URL, CONF_VERIFY_SSL, Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .api import VurioClient
from .coordinator import VurioCoordinator
from .views import register

PLATFORMS = [
    Platform.BINARY_SENSOR,
    Platform.CAMERA,
    Platform.IMAGE,
    Platform.SENSOR,
    Platform.SWITCH,
]

type VurioConfigEntry = ConfigEntry[VurioCoordinator]


async def async_setup_entry(hass: HomeAssistant, entry: VurioConfigEntry) -> bool:
    """Connect to one Vurio installation."""
    session = async_get_clientsession(hass, verify_ssl=entry.data.get(CONF_VERIFY_SSL, True))
    client = VurioClient(session, entry.data[CONF_URL], entry.data[CONF_TOKEN])
    coordinator = VurioCoordinator(hass, entry, client)

    await coordinator.async_config_entry_first_refresh()
    entry.runtime_data = coordinator
    coordinator.start_stream()
    register(hass)

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: VurioConfigEntry) -> bool:
    """Disconnect. The event stream is a background task of the entry and ends with it."""
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
