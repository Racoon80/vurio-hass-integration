"""What every Vurio entity shares: one device per camera."""

from __future__ import annotations

from collections.abc import Callable, Iterable
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import callback
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity import Entity
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN
from .coordinator import VurioCoordinator


class VurioEntity(CoordinatorEntity[VurioCoordinator]):
    """Something about one camera."""

    _attr_has_entity_name = True

    def __init__(self, coordinator: VurioCoordinator, camera: str, key: str) -> None:
        super().__init__(coordinator)
        self.camera = camera
        installation = coordinator.config_entry.unique_id or coordinator.config_entry.entry_id
        state = coordinator.data.cameras.get(camera, {})

        self._attr_unique_id = f"{installation}_{camera}_{key}"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, f"{installation}_{camera}")},
            name=state.get("display_name") or camera,
            manufacturer="Vurio",
            model="Camera",
            sw_version=coordinator.data.version or None,
            configuration_url=coordinator.client.url,
        )

    @property
    def state_of(self) -> dict[str, Any]:
        """The camera as Vurio last described it."""
        return self.coordinator.data.cameras.get(self.camera, {})

    @property
    def available(self) -> bool:
        return super().available and self.camera in self.coordinator.data.cameras


def add_per_camera(
    coordinator: VurioCoordinator,
    entry: ConfigEntry,
    add_entities: Callable[[Iterable[Entity]], None],
    build: Callable[[str, dict[str, Any]], Iterable[Entity]],
) -> None:
    """Add a camera's entities now, and those of every camera added later."""
    known: set[str] = set()

    @callback
    def add_new() -> None:
        new = [name for name in coordinator.data.cameras if name not in known]
        if not new:
            return
        entities: list[Entity] = []
        for name in new:
            known.add(name)
            entities.extend(build(name, coordinator.data.cameras[name]))
        add_entities(entities)

    add_new()
    entry.async_on_unload(coordinator.async_add_listener(add_new))
