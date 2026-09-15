"""Adding a Vurio installation: its address and an API token."""

from __future__ import annotations

from collections.abc import Mapping
from typing import Any

import voluptuous as vol
from yarl import URL

from homeassistant.config_entries import ConfigFlow, ConfigFlowResult
from homeassistant.const import CONF_TOKEN, CONF_URL, CONF_VERIFY_SSL
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .api import VurioAuthError, VurioClient, VurioError, VurioPermissionError
from .const import DOMAIN, REQUIRED_PERMISSION

USER_SCHEMA = vol.Schema(
    {
        vol.Required(CONF_URL): str,
        vol.Required(CONF_TOKEN): str,
        vol.Optional(CONF_VERIFY_SSL, default=True): bool,
    }
)

REAUTH_SCHEMA = vol.Schema({vol.Required(CONF_TOKEN): str})


def normalised(url: str) -> str:
    """The address as it is stored: scheme and host, no trailing slash."""
    url = url.strip().rstrip("/")
    if "://" not in url:
        url = f"http://{url}"
    return url


async def validate(hass: HomeAssistant, url: str, token: str, verify_ssl: bool) -> str:
    """Check the token against the installation; the title the entry gets."""
    client = VurioClient(async_get_clientsession(hass, verify_ssl=verify_ssl), url, token)
    me = await client.me()
    if REQUIRED_PERMISSION not in me.get("permissions", []):
        raise VurioPermissionError(f"the token needs {REQUIRED_PERMISSION}")
    await client.integration()
    return f"Vurio ({URL(url).host})"


class VurioConfigFlow(ConfigFlow, domain=DOMAIN):
    """Set up Vurio."""

    VERSION = 1

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        errors: dict[str, str] = {}

        if user_input is not None:
            url = normalised(user_input[CONF_URL])
            token = user_input[CONF_TOKEN].strip()
            verify_ssl = user_input.get(CONF_VERIFY_SSL, True)

            try:
                title = await validate(self.hass, url, token, verify_ssl)
            except VurioAuthError:
                errors["base"] = "invalid_auth"
            except VurioPermissionError:
                errors["base"] = "missing_permission"
            except VurioError:
                errors["base"] = "cannot_connect"
            else:
                await self.async_set_unique_id(url.lower())
                self._abort_if_unique_id_configured()
                return self.async_create_entry(
                    title=title,
                    data={CONF_URL: url, CONF_TOKEN: token, CONF_VERIFY_SSL: verify_ssl},
                )

        return self.async_show_form(
            step_id="user",
            data_schema=self.add_suggested_values_to_schema(USER_SCHEMA, user_input),
            errors=errors,
        )

    async def async_step_reauth(self, entry_data: Mapping[str, Any]) -> ConfigFlowResult:
        """The token was revoked or expired."""
        return await self.async_step_reauth_confirm()

    async def async_step_reauth_confirm(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        entry = self._get_reauth_entry()
        errors: dict[str, str] = {}

        if user_input is not None:
            token = user_input[CONF_TOKEN].strip()
            try:
                await validate(
                    self.hass, entry.data[CONF_URL], token, entry.data.get(CONF_VERIFY_SSL, True)
                )
            except VurioAuthError:
                errors["base"] = "invalid_auth"
            except VurioPermissionError:
                errors["base"] = "missing_permission"
            except VurioError:
                errors["base"] = "cannot_connect"
            else:
                return self.async_update_reload_and_abort(entry, data_updates={CONF_TOKEN: token})

        return self.async_show_form(
            step_id="reauth_confirm",
            data_schema=REAUTH_SCHEMA,
            errors=errors,
            description_placeholders={"url": entry.data[CONF_URL]},
        )
