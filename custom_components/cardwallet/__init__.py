from .api import CardWalletListAPI, CardWalletItemAPI
from .services.storage import CardStorage

async def async_setup(hass, config):
    storage = CardStorage(hass)
    await storage.load()

    hass.http.register_view(CardWalletListAPI(hass))
    hass.http.register_view(CardWalletItemAPI(hass))

    return True