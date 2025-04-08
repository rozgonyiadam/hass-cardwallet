# CardWallet – Custom Integration for Home Assistant

**CardWallet** is a custom integration and frontend card for Home Assistant.  
Manage personal loyalty cards per user, displayed as QR or barcode — with optional shared access.

---

## Features

- ✅ View and manage your own cards
- 👥 See cards added by other users
- 🔄 Switch between QR code and barcode views
- 📝 Edit or delete your cards
- ➕ Add new cards directly from the UI
- 📱 Responsive design
- 🔐 Per-user data isolation

---

## 📦 Installation

### 1. Copy files

- Copy backend files to: `custom_components/cardwallet/`
- Copy frontend files (JS, libs) to: `www/cardwallet/`

> Home Assistant serves `www/` as `/local/`  
> So `www/cardwallet/qrcode.min.js` becomes available at `/local/cardwallet/qrcode.min.js`

📚 [More info on serving local files in HA](https://developers.home-assistant.io/docs/frontend/custom-ui/registering-resources)

### 2. Restart Home Assistant
After copying files and updating config, restart HA.

No restart is needed for `www/cardwallet/`, but you may need to clear your browser cache if changes don't appear.

### 3. Configure configuration.yaml
Add the following to your configuration.yaml:
```yaml
cardwallet:
```
### 4. Register frontend in Lovelace

To use the custom card, register the JS file in Lovelace:

#### Option A – via UI (recommended)
- Go to **Settings → Dashboards → Resources**
- Click **"Add Resource"**
- URL: `/local/cardwallet/cardwallet-card.js`  
- Type: `JavaScript Module`

#### Option B – via `configuration.yaml`
```yaml
lovelace:
  resources:
    - url: /local/cardwallet/cardwallet-card.js
      type: module
```

### 5. Add the card to your Dashboard
Manually add a Manual card with the following config:

```yaml
type: 'custom:cardwallet-card'
```

## 🙏 Credits

- [QRCode.js](https://github.com/davidshimjs/qrcodejs) — Used for QR code generation
- [JsBarcode](https://github.com/lindell/JsBarcode) — Used for barcode rendering