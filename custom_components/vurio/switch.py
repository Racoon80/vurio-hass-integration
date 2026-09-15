"""Switching a camera's recording and detection from Home Assistant.

Only for cameras the token may manage and Vurio keeps in its database: a camera
its configuration file declares cannot be changed from anywhere but that file,
and gets no switches rather than switches that fail.
"""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

from homeassistant.components.switch import SwitchEntity
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .api import VurioError
from .coordinator import VurioCoordinator
from .entity import VurioEntity, add_per_camera

if TYPE_CHECKING:
    from . import VurioConfigEntry

# Entity key, the camera field it reflects, and the API route that changes it.
SWITCHES = (
    ("recording", "recording", "enabled"),
    ("detection", "detection", "detection"),
)


async def async_setup_entry(
    hass: HomeAssistant, entry: VurioConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    coordinator = entry.runtime_data
    add_per_camera(
        coordinator,
        entry,
        async_add_entities,
        lambda name, state: [
            VurioSwitch(coordinator, name, key, field, route)
            for key, field, route in SWITCHES
            if state.get("switchable")
        ],
    )


class VurioSwitch(VurioEntity, SwitchEntity):
    """Recording or detection, on or off."""

    def __init__(
        self, coordinator: VurioCoordinator, camera: str, key: str, field: str, route: str
    ) -> None:
        super().__init__(coordinator, camera, key)
        self._attr_translation_key = key
        self.field = field
        self.route = route

    @property
    def is_on(self) -> bool:
        return bool(self.state_of.get(self.field))

    async def async_turn_on(self, **kwargs: Any) -> None:
        await self._switch(True)

    async def async_turn_off(self, **kwargs: Any) -> None:
        await self._switch(False)

    async def _switch(self, on: bool) -> None:
        try:
            await self.coordinator.client.switch(self.camera, self.route, on)
        except VurioError as err:
            raise HomeAssistantError(f"Vurio did not switch {self.camera}: {err}") from err
        # Shown at once; Vurio's own account follows on the event stream.
        self.coordinator.set_camera(self.camera, **{self.field: on})
