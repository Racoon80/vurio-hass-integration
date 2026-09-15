"""The Vurio card, served by the integration and loaded into every dashboard.

Shipped with the integration rather than as a separate frontend plugin, so the
card and the websocket commands it calls are always the same version, and
installing Vurio is one step.
"""

from __future__ import annotations

from pathlib import Path

from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant
from homeassistant.loader import async_get_integration

from .const import DOMAIN, LOGGER

URL = "/vurio_static"
FILES = Path(__file__).parent / "frontend"


async def async_register(hass: HomeAssistant) -> None:
    """Serve the card and add it to the frontend, once per Home Assistant."""
    key = f"{DOMAIN}_frontend"
    if hass.data.get(key) or hass.http is None:
        return
    hass.data[key] = True

    if not (FILES / "vurio-card.js").is_file():
        LOGGER.warning("the Vurio card is missing from this installation; dashboards cannot show it")
        return

    # No long-lived cache headers: the version in the address is what changes.
    await hass.http.async_register_static_paths([StaticPathConfig(URL, str(FILES), False)])
    version = (await async_get_integration(hass, DOMAIN)).version

    # Served either way; added to dashboards only where there is a frontend to
    # add it to. `frontend` is an after-dependency, so in a normal Home Assistant
    # it is set up by now.
    if "frontend" not in hass.config.components:
        LOGGER.debug("no frontend to add the Vurio card to")
        return

    from homeassistant.components.frontend import add_extra_js_url

    add_extra_js_url(hass, f"{URL}/vurio-card.js?v={version}")
