from dataclasses import dataclass
from typing import Optional

DEFAULT_CARD_VIEW = "barcode"
ALLOWED_DEFAULT_VIEWS = {DEFAULT_CARD_VIEW, "qr"}


def coerce_default_view(value) -> Optional[str]:
    if not isinstance(value, str):
        return None

    default_view = value.strip()
    if default_view not in ALLOWED_DEFAULT_VIEWS:
        return None

    return default_view


@dataclass
class Card:
    card_id: str
    name: str
    code: str
    owner: str
    user_id: str
    format: Optional[str] = "CODE128"
    logo_slug: Optional[str] = None
    default_view: str = DEFAULT_CARD_VIEW
