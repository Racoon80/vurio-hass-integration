"""Motion, people, vehicles and animals in front of a camera, and whether it records."""

from __future__ import annotations

from typing import TYPE_CHECKING

from homeassistant.components.binary_sensor import (
    BinarySensorDeviceClass,
    BinarySensorEntity,
)
from homeassistant.const import EntityCategory
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import KINDS
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
        lambda name, _state: [
            *(VurioDetection(coordinator, name, kind) for kind in KINDS),
            VurioOnline(coordinator, name),
        ],
    )


class VurioDetection(VurioEntity, BinarySensorEntity):
    """On while an event of this kind is open on the camera."""

    def __init__(self, coordinator: VurioCoordinator, camera: str, kind: str) -> None:
        super().__init__(coordinator, camera, kind)
        self.kind = kind
        self._attr_translation_key = kind
        self._attr_device_class = (
            BinarySensorDeviceClass.MOTION if kind == "motion" else BinarySensorDeviceClass.OCCUPANCY
        )

    @property
    def is_on(self) -> bool:
        return bool(self.state_of.get("sensors", {}).get(self.kind))


class VurioOnline(VurioEntity, BinarySensorEntity):
    """Whether the camera is recording and producing footage."""

    _attr_translation_key = "online"
    _attr_device_class = BinarySensorDeviceClass.CONNECTIVITY
    _attr_entity_category = EntityCategory.DIAGNOSTIC

    def __init__(self, coordinator: VurioCoordinator, camera: str) -> None:
        super().__init__(coordinator, camera, "online")

    @property
    def is_on(self) -> bool:
        return bool(self.state_of.get("online"))
