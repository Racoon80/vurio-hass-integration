"""Adding Vurio."""

from __future__ import annotations

from unittest.mock import patch

from homeassistant import config_entries
from homeassistant.const import CONF_TOKEN, CONF_URL, CONF_VERIFY_SSL
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType
from pytest_homeassistant_custom_component.test_util.aiohttp import AiohttpClientMocker

from custom_components.vurio.const import DOMAIN

from .conftest import ME, URL, integration


async def start(hass: HomeAssistant, **given):
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    assert result["type"] is FlowResultType.FORM
    return await hass.config_entries.flow.async_configure(
        result["flow_id"],
        {CONF_URL: f"{URL}/", CONF_TOKEN: " token ", CONF_VERIFY_SSL: True, **given},
    )


async def test_a_working_token_adds_the_installation(
    hass: HomeAssistant, aioclient_mock: AiohttpClientMocker
) -> None:
    aioclient_mock.get(f"{URL}/api/auth/me", json=ME)
    aioclient_mock.get(f"{URL}/api/integration", json=integration())

    # The entry is set up the moment it is made; that is the other tests' subject.
    with patch("custom_components.vurio.async_setup_entry", return_value=True):
        result = await start(hass)
        await hass.async_block_till_done()

    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert result["title"] == "Vurio (vurio.local)"
    assert result["data"] == {CONF_URL: URL, CONF_TOKEN: "token", CONF_VERIFY_SSL: True}
    assert aioclient_mock.mock_calls[0][3]["Authorization"] == "Bearer token"


async def test_a_refused_token_says_so(
    hass: HomeAssistant, aioclient_mock: AiohttpClientMocker
) -> None:
    aioclient_mock.get(f"{URL}/api/auth/me", status=401)

    result = await start(hass)

    assert result["type"] is FlowResultType.FORM
    assert result["errors"] == {"base": "invalid_auth"}


async def test_a_token_that_may_not_watch_is_refused(
    hass: HomeAssistant, aioclient_mock: AiohttpClientMocker
) -> None:
    aioclient_mock.get(f"{URL}/api/auth/me", json={**ME, "permissions": ["events:read"]})

    result = await start(hass)

    assert result["errors"] == {"base": "missing_permission"}


async def test_an_address_with_nothing_there_cannot_connect(
    hass: HomeAssistant, aioclient_mock: AiohttpClientMocker
) -> None:
    aioclient_mock.get(f"{URL}/api/auth/me", status=502)

    result = await start(hass)

    assert result["errors"] == {"base": "cannot_connect"}
