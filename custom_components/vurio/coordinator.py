"""Keeps one Vurio installation's state, pushed rather than polled.

The whole state is read once, then Vurio's event stream carries every change:
a sensor turning on arrives as it happens. A full read every few minutes stays
as a safety net for anything a dropped connection missed.
"""

from __future__ import annotations

import asyncio
from dataclasses import dataclass, replace
from datetime import timedelta
from typing import TYPE_CHECKING, Any

from homeassistant.core import HomeAssistant, callback
from homeassistant.exceptions import ConfigEntryAuthFailed
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .api import VurioAuthError, VurioClient, VurioError
from .const import DOMAIN, LOGGER

if TYPE_CHECKING:
    from homeassistant.config_entries import ConfigEntry

# The longest wait between attempts to open the event stream again.
RETRY_MAX = 60


@dataclass(frozen=True)
class VurioData:
    """What one installation looks like now."""

    version: str
    # Where and how to play the cameras over RTSP; None when Vurio does not
    # restream, or the token may not watch every camera.
    restream: dict[str, Any] | None
    cameras: dict[str, dict[str, Any]]


def parse(payload: dict[str, Any]) -> VurioData:
    """The answer of `GET /api/integration`."""
    return VurioData(
        version=str(payload.get("version", "")),
        restream=payload.get("restream"),
        cameras={camera["name"]: camera for camera in payload.get("cameras", [])},
    )


class VurioCoordinator(DataUpdateCoordinator[VurioData]):
    """One installation's cameras."""

    config_entry: ConfigEntry

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry, client: VurioClient) -> None:
        super().__init__(
            hass,
            LOGGER,
            config_entry=entry,
            name=DOMAIN,
            update_interval=timedelta(minutes=5),
        )
        self.client = client
        # Width over height of each camera's main stream. A substream is the
        # same picture made smaller, not always kept in shape — an Anpviz sends
        # 720×480 of a 16:9 sensor — so the card draws every stream of a camera
        # in this shape rather than in the one its pixels happen to have.
        self.aspects: dict[str, float] = {}
        self._measuring = False

    async def _async_update_data(self) -> VurioData:
        try:
            data = parse(await self.client.integration())
        except VurioAuthError as err:
            raise ConfigEntryAuthFailed(str(err)) from err
        except VurioError as err:
            raise UpdateFailed(str(err)) from err

        unmeasured = [name for name in data.cameras if name not in self.aspects]
        if unmeasured and not self._measuring:
            self._measuring = True
            self.hass.async_create_task(self._measure(unmeasured), f"{DOMAIN} measure cameras")

        return data

    async def _measure(self, cameras: list[str]) -> None:
        """Learn each camera's shape once. A shape is cosmetic: nothing here may fail setup."""
        try:
            for camera in cameras:
                try:
                    size = await self.client.measured(camera)
                except Exception as err:  # noqa: BLE001 - the card falls back to 16:9
                    LOGGER.debug("could not measure %s: %s", camera, err)
                    continue
                if size:
                    self.aspects[camera] = round(size[0] / size[1], 4)
        finally:
            self._measuring = False

    def start_stream(self) -> None:
        """Listen to Vurio's events until the entry is unloaded."""
        self.config_entry.async_create_background_task(
            self.hass, self._listen(), f"{DOMAIN} event stream"
        )

    async def _listen(self) -> None:
        delay = 1
        while True:
            try:
                async for name, data in self.client.stream():
                    delay = 1
                    self.handle(name, data)
            except VurioAuthError:
                self.config_entry.async_start_reauth(self.hass)
                return
            except (VurioError, ValueError, KeyError, TypeError) as err:
                LOGGER.debug("Vurio's event stream ended: %s", err)
            except Exception:  # noqa: BLE001 - one surprise must not end the stream for good
                # The task is the only thing that ever opens the stream again.
                # An error it did not expect used to end it silently, and every
                # sensor then stayed as it was until Home Assistant restarted.
                LOGGER.warning("Vurio's event stream failed; opening it again", exc_info=True)
            await asyncio.sleep(delay)
            delay = min(delay * 2, RETRY_MAX)

    @callback
    def handle(self, name: str, data: Any) -> None:
        """Take one event from the stream in."""
        if self.data is None:
            return

        cameras = dict(self.data.cameras)

        if name == "cameras":
            cameras = {camera["name"]: camera for camera in data}
        elif name == "changed":
            for camera in data:
                cameras[camera["name"]] = camera
        elif name == "sensor":
            camera = cameras.get(data["camera"])
            if camera is None:
                return
            cameras[data["camera"]] = {
                **camera,
                "sensors": {**camera.get("sensors", {}), data["kind"]: bool(data["on"])},
            }
        else:
            return

        self.async_set_updated_data(replace(self.data, cameras=cameras))

    @callback
    def set_camera(self, camera: str, **changes: Any) -> None:
        """Change what is known about a camera ahead of Vurio saying so."""
        if self.data is None or camera not in self.data.cameras:
            return
        cameras = dict(self.data.cameras)
        cameras[camera] = {**cameras[camera], **changes}
        self.async_set_updated_data(replace(self.data, cameras=cameras))
