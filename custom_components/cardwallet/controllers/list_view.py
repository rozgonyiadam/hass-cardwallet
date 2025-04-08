from homeassistant.components.http import HomeAssistantView
from custom_components.cardwallet.models.card import Card
from custom_components.cardwallet.services.storage import CardStorage
from uuid import uuid4

class CardWalletListAPI(HomeAssistantView):
    url = "/api/cardwallet"
    name = "api:cardwallet:list"
    requires_auth = True

    def __init__(self, hass):
        self.storage = CardStorage(hass)

    async def get(self, request):
        cards = await self.storage.get_all()
        return self.json([card.__dict__ for card in cards])

    async def post(self, request):
        data = await request.json()
        required = ["name", "code", "owner", "user_id"]

        if not all(k in data for k in required):
            return self.json({"error": "missing fields"}, status_code=400)

        card_data = {k: data[k] for k in required}
        card_data["card_id"] = str(uuid4())
        card = Card(**card_data)
        saved = await self.storage.add_card(card)

        return self.json(saved.__dict__)

