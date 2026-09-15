"""A camera entity per Vurio camera: its live stream and its picture."""

from __future__ import annotations

from typing import TYPE_CHECKING

from homeassistant.components.camera import Camera, CameraEntityFeature
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .api import rtsp_url
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
        lambda name, _state: [VurioCamera(coordinator, name)],
    )


class VurioCamera(VurioEntity, Camera):
    """The live picture, played from Vurio's RTSP restream when it has one."""

    # The device's own name: `camera.garden`, not `camera.garden_camera`.
    _attr_name = None

    def __init__(self, coordinator: VurioCoordinator, camera: str) -> None:
        VurioEntity.__init__(self, coordinator, camera, "camera")
        Camera.__init__(self)

    @property
    def supported_features(self) -> CameraEntityFeature:
        if self.coordinator.data.restream:
            return CameraEntityFeature.STREAM
        return CameraEntityFeature(0)

    @property
    def is_on(self) -> bool:
        return bool(self.state_of.get("recording"))

    @property
    def is_recording(self) -> bool:
        return bool(self.state_of.get("online"))

    async def stream_source(self) -> str | None:
        restream = self.coordinator.data.restream
        if not restream:
            return None
        return rtsp_url(self.coordinator.client.host, restream, self.camera)

    async def async_camera_image(
        self, width: int | None = None, height: int | None = None
    ) -> bytes | None:
        return await self.coordinator.client.snapshot(self.camera, width)
