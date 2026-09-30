"""Adding Vurio."""

from __future__ import annotations

from ipaddress import ip_address
from unittest.mock import patch

from homeassistant import config_entries
from homeassistant.helpers.service_info.zeroconf import ZeroconfServiceInfo
from pytest_homeassistant_custom_component.common import MockConfigEntry
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


DISCOVERED = ZeroconfServiceInfo(
    ip_address=ip_address("192.168.1.10"),
    ip_addresses=[ip_address("192.168.1.10")],
    port=8099,
    hostname="vurio.local.",
    type="_vurio._tcp.local.",
    name="Vurio on vurio._vurio._tcp.local.",
    properties={"version": "0.0.1", "path": "/"},
)

FOUND = "http://192.168.1.10:8099"


async def test_vurio_found_on_the_network_asks_only_for_the_token(
    hass: HomeAssistant, aioclient_mock: AiohttpClientMocker
) -> None:
    aioclient_mock.get(f"{FOUND}/api/auth/me", json=ME)
    aioclient_mock.get(f"{FOUND}/api/integration", json=integration())

    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_ZEROCONF}, data=DISCOVERED
    )
    assert result["type"] is FlowResultType.FORM
    assert result["step_id"] == "zeroconf_confirm"
    assert result["description_placeholders"] == {"url": FOUND}

    with patch("custom_components.vurio.async_setup_entry", return_value=True):
        result = await hass.config_entries.flow.async_configure(
            result["flow_id"], {CONF_TOKEN: "token"}
        )
        await hass.async_block_till_done()

    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert result["data"] == {CONF_URL: FOUND, CONF_TOKEN: "token", CONF_VERIFY_SSL: True}


async def test_vurio_found_again_is_not_offered_twice(
    hass: HomeAssistant, aioclient_mock: AiohttpClientMocker
) -> None:
    MockConfigEntry(domain=DOMAIN, unique_id=FOUND, data={CONF_URL: FOUND, CONF_TOKEN: "t"}).add_to_hass(
        hass
    )

    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_ZEROCONF}, data=DISCOVERED
    )

    assert result["type"] is FlowResultType.ABORT
    assert result["reason"] == "already_configured"


async def test_reconfigure_replaces_the_token_and_keeps_the_entry(
    hass: HomeAssistant, aioclient_mock: AiohttpClientMocker
) -> None:
    entry = MockConfigEntry(
        domain=DOMAIN,
        unique_id=URL,
        data={CONF_URL: URL, CONF_TOKEN: "watch-only", CONF_VERIFY_SSL: True},
    )
    entry.add_to_hass(hass)
    aioclient_mock.get(f"{URL}/api/auth/me", json=ME)
    aioclient_mock.get(f"{URL}/api/integration", json=integration())

    result = await entry.start_reconfigure_flow(hass)
    assert result["type"] is FlowResultType.FORM
    assert result["step_id"] == "reconfigure"

    with patch("custom_components.vurio.async_setup_entry", return_value=True):
        result = await hass.config_entries.flow.async_configure(
            result["flow_id"], {CONF_URL: URL, CONF_TOKEN: "everything", CONF_VERIFY_SSL: True}
        )
        await hass.async_block_till_done()

    assert result["type"] is FlowResultType.ABORT
    assert result["reason"] == "reconfigure_successful"
    assert entry.data[CONF_TOKEN] == "everything"
    assert len(hass.config_entries.async_entries(DOMAIN)) == 1


async def test_a_token_with_only_recordings_read_is_refused_by_name(
    hass: HomeAssistant, aioclient_mock: AiohttpClientMocker
) -> None:
    aioclient_mock.get(f"{URL}/api/auth/me", json={**ME, "permissions": ["recordings:read"]})

    result = await start(hass)

    assert result["errors"] == {"base": "missing_permission"}


async def test_an_address_with_nothing_there_cannot_connect(
    hass: HomeAssistant, aioclient_mock: AiohttpClientMocker
) -> None:
    aioclient_mock.get(f"{URL}/api/auth/me", status=502)

    result = await start(hass)

    assert result["errors"] == {"base": "cannot_connect"}
