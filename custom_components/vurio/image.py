"""The picture from the moment of a camera's latest event."""

from __future__ import annotations

from typing import TYPE_CHECKING

from homeassistant.components.image import ImageEntity
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.util import dt as dt_util

from .const import KINDS
from .coordinator import VurioCoordinator
from .entity import VurioEntity, add_per_camera

if TYPE_CHECKING:
    from . import VurioConfigEntry

# Wide enough for a card, small enough to fetch at every event.
WIDTH = 640


async def async_setup_entry(
    hass: HomeAssistant, entry: VurioConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    coordinator = entry.runtime_data
    add_per_camera(
        coordinator,
        entry,
        async_add_entities,
        lambda name, _state: [VurioLastEvent(hass, coordinator, name)],
    )


class VurioLastEvent(VurioEntity, ImageEntity):
    """Changes whenever something is detected on the camera."""

    _attr_translation_key = "last_event"
    _attr_content_type = "image/jpeg"

    def __init__(self, hass: HomeAssistant, coordinator: VurioCoordinator, camera: str) -> None:
        VurioEntity.__init__(self, coordinator, camera, "last_event")
        ImageEntity.__init__(self, hass)
        self._on = self._sensors_on()
        # So the newest event already there is shown from the start.
        self._attr_image_last_updated = dt_util.utcnow()

    def _sensors_on(self) -> set[str]:
        sensors = self.state_of.get("sensors", {})
        return {kind for kind in KINDS if kind != "motion" and sensors.get(kind)}

    @callback
    def _handle_coordinator_update(self) -> None:
        on = self._sensors_on()
        if on - self._on:
            self._attr_image_last_updated = dt_util.utcnow()
            self._cached_image = None
        self._on = on
        super()._handle_coordinator_update()

    async def async_image(self) -> bytes | None:
        event = await self.coordinator.client.latest_event(self.camera)
        if event is None:
            return None
        return await self.coordinator.client.event_frame(str(event["id"]), WIDTH)
