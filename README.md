# CardWallet – Custom Integration for Home Assistant

**CardWallet** is a custom integration for Home Assistant that provides a backend API to manage wallet cards (e.g., loyalty cards, membership cards) linked to Home Assistant users.

![Popup Barcode](/assets/barcode.png)

---

## 📦 Installation

### HACS (Recommended)

Add this repository to HACS as a custom integration.

- HACS → Integrations → "+" → "Custom repositories"
- Add the repository URL: `https://github.com/rozgonyiadam/hass-cardwallet`
- Category: Integration
- Install and restart Home Assistant.

### Manual Installation

- Copy the `cardwallet` directory into your Home Assistant `config/custom_components` directory.
- Restart Home Assistant.

## ⚙️ Configuration
Add the following to your configuration.yaml:
```yaml
cardwallet:
```

## 📚 API

This integration provides the following REST API endpoints:

- `GET /api/cardwallet` - Get a list of cards
- `POST /api/cardwallet` - Add a new card
- `PUT /api/cardwallet/{card_id}` - Update a card's information
- `DELETE /api/cardwallet/{card_id}` - Delete a card

All endpoints require an authenticated Home Assistant user.

## 🖥️ Frontend Card

A custom Lovelace card is available to display your CardWallet cards visually:  
👉 [lovelace-cardwallet](https://github.com/rozgonyiadam/lovelace-cardwallet)

---