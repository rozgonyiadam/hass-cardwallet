from dataclasses import dataclass
from typing import Optional

@dataclass
class Card:
    card_id: str
    name: str
    code: str
    owner: str
    user_id: str