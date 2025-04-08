from homeassistant.components.http import HomeAssistantView
from custom_components.cardwallet.services.storage import CardStorage

class CardWalletItemAPI(HomeAssistantView):
    url = "/api/cardwallet/{card_id}"
    name = "api:cardwallet:item"
    requires_auth = True

    def __init__(self, hass):
        self.storage = CardStorage(hass)

    async def delete(self, request, card_id):
        data = await request.json()
        user_id = data.get("user_id")

        if not user_id or not card_id:
            return self.json({"error": "missing user_id or card_id"}, status_code=400)
        
        card = await self.storage.get_card_by_id(card_id)
        if not card:
            return self.json({"error": "card not found"}, status_code=404)
        
        if card.user_id != user_id:
            return self.json({"error": "not allowed to delete this card"}, status_code=403)

        deleted = await self.storage.delete_card(user_id, card_id)
        return self.json({"status": "deleted" if deleted else "not found"})


    async def put(self, request, card_id):
        data = await request.json()
        user_id = data.get("user_id")

        if not user_id or not card_id:
            return self.json({"error": "missing user_id or card_id"}, status_code=400)

        updated = await self.storage.update_card(user_id, card_id, data)
        if updated:
            return self.json(updated.__dict__)
        return self.json({"error": "card not found"}, status_code=404)