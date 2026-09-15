"""What a camera's schedule has it doing now."""

from __future__ import annotations

from typing import TYPE_CHECKING

from homeassistant.components.sensor import SensorDeviceClass, SensorEntity
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import MODES
from .coordinator import VurioCoordinator
from .entity import VurioEntity, add_per_camera

if TYPE_CHECKING:
    from . import VurioConfigEntry


async def async_setup_entry(
    hass: HomeAssistant, entry: VurioConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    coordinator = entry.runtime_data
    add_per_camera(
        coordinator,
        entry,
        async_add_entities,
        lambda name, _state: [VurioSchedule(coordinator, name)],
    )


class VurioSchedule(VurioEntity, SensorEntity):
    """Continuous, events or off, by the half hour of the camera's week."""

    _attr_translation_key = "schedule"
    _attr_device_class = SensorDeviceClass.ENUM
    _attr_options = list(MODES)

    def __init__(self, coordinator: VurioCoordinator, camera: str) -> None:
        super().__init__(coordinator, camera, "schedule")

    @property
    def native_value(self) -> str | None:
        mode = self.state_of.get("mode")
        return mode if mode in MODES else None
