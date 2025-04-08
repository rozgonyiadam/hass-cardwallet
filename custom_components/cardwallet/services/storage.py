import json
import aiofiles
import os
from typing import List, Optional
from .path_utils import get_storage_path
from custom_components.cardwallet.models.card import Card


class CardStorage:
    _instance = None

    def __new__(cls, hass):
        if cls._instance is None:
            cls._instance = super(CardStorage, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self, hass):
        if self._initialized:
            return
        self.hass = hass
        self.file_path = get_storage_path(hass)
        self.cards: List[Card] = []
        self._initialized = True

    async def load(self):
        if not os.path.exists(self.file_path):
            self.cards = []
            return

        async with aiofiles.open(self.file_path, "r", encoding="utf-8") as f:
            contents = await f.read()
            try:
                data = json.loads(contents)
                self.cards = [Card(**c) for c in data]
            except json.JSONDecodeError:
                self.cards = []

    async def _save_cards(self):
        async with aiofiles.open(self.file_path, "w", encoding="utf-8") as f:
            data = json.dumps([c.__dict__ for c in self.cards], indent=2)
            await f.write(data)

    def get_user_cards(self, user_id: str) -> List[Card]:
        return [c for c in self.cards if c.user_id == user_id]

    async def add_card(self, card: Card) -> Card:
        self.cards.append(card)
        await self._save_cards()
        return card

    def share_card(self, card_id: str):
        for card in self.cards:
            if card.card_id == card_id:
                card.shared = True

    def get_shared_cards(self) -> List[Card]:
        return [c for c in self.cards if c.shared]

    async def update_card(self, user_id: str, card_id: str, new_data: dict) -> Optional[Card]:
        for idx, card in enumerate(self.cards):
            if card.card_id == card_id and card.user_id == user_id:
                updated_card = Card(**{**card.__dict__, **new_data})
                self.cards[idx] = updated_card
                await self._save_cards()
                return updated_card
        return None

    async def delete_card(self, user_id: str, card_id: str) -> bool:
        original_len = len(self.cards)
        self.cards = [c for c in self.cards if not (c.card_id == card_id and c.user_id == user_id)]
        if len(self.cards) < original_len:
            await self._save_cards()
            return True
        return False

    async def get_all(self) -> List[Card]:
        return self.cards
    
    async def get_card_by_id(self, card_id: str) -> Optional[Card]:
        return next((c for c in self.cards if c.card_id == card_id), None)