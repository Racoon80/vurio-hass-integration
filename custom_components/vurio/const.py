"""Constants for the Vurio integration."""

from __future__ import annotations

import logging

DOMAIN = "vurio"
LOGGER = logging.getLogger(__package__)

# The kinds of event a camera has a sensor for, as Vurio names them.
KINDS = ("motion", "person", "vehicle", "animal")

# What a camera's schedule can have it doing now.
MODES = ("continuous", "events", "off")

# What a token needs for the integration to work at all.
REQUIRED_PERMISSION = "live:view"
