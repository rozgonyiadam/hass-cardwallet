class CardWalletCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });

        this.viewModes = {};
        this.selectedCard = null;
        this.activeTab = "own";
        this.qrLoaded = false;
        this._inputState = { name: "", code: "" };

        this.inputContainer = document.createElement("div");
        this.dynamicContainer = document.createElement("div");

        const style = document.createElement("style");
        style.textContent = `
      .tabs {
          display: flex;
          justify-content: space-around;
          margin-top: 8px;
      }
      .tab {
          flex: 1;
          padding: 0.5em;
          text-align: center;
          cursor: pointer;
          background: #333;
          color: #fff;
      }
      .tab.active {
          background: #555;
          font-weight: bold;
      }
      .cardlist {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 300px;
          overflow-y: auto;
      }
      .card {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 0.5em;
          border: 1px solid #ccc;
          cursor: pointer;
          min-height: 3.5em;
      }
      .card small {
          font-size: 0.85em;
          color: #bbb;
      }
      .popup {
          position: fixed;
          top: 10%;
          left: 50%;
          transform: translateX(-50%);
          background: white;
          padding: 1em;
          border: 2px solid #ccc;
          z-index: 1000;
          box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
      }
      .card-title {
          font-weight: bold;
          font-size: 1.5em;
          color: black;
      }
      .popup .code {
          margin-top: 12px;
          display: flex;
          justify-content: center;
          align-items: center;
      }
      .popup .code canvas {
          max-width: 90vw;
          height: auto;
      }
      .button-group {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-top: 1em;
      }
      .button-group button {
          background: #666;
          color: white;
          padding: 8px 14px;
          border: none;
          font-size: 0.95em;
          cursor: pointer;
      }
      .button-group button:hover {
          background: #444;
      }
      ha-icon {
          vertical-align: middle;
          margin-right: 4px;
      }
      .new-card-row {
          display: flex;
          gap: 6px;
          align-items: stretch;
          width: 100%;
          box-sizing: border-box;
          margin-top: 1em;
      }
      .new-card-row input {
          flex: 1;
          min-width: 0;
          padding: 6px;
          box-sizing: border-box;
      }
      .new-card-row button {
          flex: 0 0 auto;
          padding: 6px;
          background-color: #444;
          color: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
          cursor: pointer;
      }
      .new-card-row button ha-icon {
          color: white;
      }
      .close-btn {
          position: absolute;
          top: 8px;
          right: 8px;
          cursor: pointer;
          --mdc-icon-size: 24px;
          color: #888;
          transition: color 0.2s;
      }
      .close-btn:hover {
          color: #e00;
      }
    `;
        this.shadowRoot.appendChild(style);

        // Separate input fields to avoid losing user input on re-render
        this.inputContainer.innerHTML = `
      <form id="new-card-form" class="new-card-row">
        <input id="name" placeholder="Name" />
        <input id="code" placeholder="Code" />
        <button type="submit" title="Add Card">
          <ha-icon icon="mdi:plus"></ha-icon>
        </button>
      </form>
    `;
        this.shadowRoot.appendChild(this.inputContainer);
        this.shadowRoot.appendChild(this.dynamicContainer);

        // Attach input form handler
        this.inputContainer
            .querySelector("#new-card-form")
            .addEventListener("submit", this.addCard.bind(this));
    }

    setConfig(config) {
        this._config = config;
    }

    set hass(hass) {
        this._hass = hass;
        if (!this.qrLoaded) {
            const qr = document.createElement("script");
            qr.src = "/local/cardwallet/qrcode.min.js";
            qr.onload = () => {
                const bc = document.createElement("script");
                bc.src = "/local/cardwallet/JsBarcode.all.min.js";
                bc.onload = () => {
                    this.qrLoaded = true;
                    this.loadCards();
                };
                this.shadowRoot.appendChild(bc);
            };
            this.shadowRoot.appendChild(qr);
        } else {
            this.loadCards();
        }
    }

    async loadCards() {
        const nameEl = this.shadowRoot.getElementById("name");
        const codeEl = this.shadowRoot.getElementById("code");
        const activeId = document.activeElement?.id;
        if (nameEl && codeEl) {
            this._inputState.name = nameEl.value;
            this._inputState.code = codeEl.value;
            this._inputState.focusId = activeId;
        }

        const all = await this._hass.callApi("get", "cardwallet");
        const uid = this._hass.user.id;
        this.ownCards = all.filter(c => c.user_id === uid);
        this.otherCards = all.filter(c => c.user_id !== uid);
        this.render();
    }

    toggleCodeType(cardId) {
        this.viewModes[cardId] = this.viewModes[cardId] === "barcode" ? "qr" : "barcode";
        this.render();
    }

    openCard(cardId) {
        this.selectedCard = [...this.ownCards, ...this.otherCards].find(c => c.card_id === cardId);
        if (!this.viewModes[cardId]) {
            this.viewModes[cardId] = "barcode";
        }
        this.render();
    }

    closeCard() {
        this.selectedCard = null;
        this.render();
    }

    async addCard(e) {
        e.preventDefault();
        const name = this.shadowRoot.getElementById("name").value;
        const code = this.shadowRoot.getElementById("code").value;
        if (!name || !code) return alert("Missing fields");
        await this._hass.callApi("post", "cardwallet", {
            name,
            code,
            owner: this._hass.user.name,
            user_id: this._hass.user.id
        });

        this._inputState = { name: "", code: "" };

        this.inputContainer.querySelector("#name").value = "";
        this.inputContainer.querySelector("#code").value = "";

        this.loadCards();
    }

    async deleteCard(card) {
        await this._hass.callApi("delete", `cardwallet/${card.card_id}`, {
            user_id: card.user_id
        });

        this.closeCard();
        this.loadCards();
    }

    async updateCard(card) {
        const newName = prompt("New name:", card.name);
        if (newName === null) return;
        await this._hass.callApi("put", `cardwallet/${card.card_id}`, {
            user_id: card.user_id,
            name: newName
        });

        if (this.selectedCard && this.selectedCard.card_id === card.card_id) {
            this.selectedCard.name = newName;
        }
        this.loadCards();
    }

    render() {
        // Save scroll of card list
        const cardListEl = this.dynamicContainer.querySelector(".cardlist");
        const scrollPosition = cardListEl ? cardListEl.scrollTop : 0;

        this.dynamicContainer.innerHTML = `
    <div class="tabs">
      <div class="tab ${this.activeTab === "own" ? "active" : ""}" id="tab-own">My Cards</div>
      <div class="tab ${this.activeTab === "others" ? "active" : ""}" id="tab-others">Others' Cards</div>
    </div>
    <div class="cardlist">
      ${(this.activeTab === "own" ? this.ownCards : this.otherCards).map(card => `
        <div class="card" data-card-id="${card.card_id}">
          <strong>${card.name}</strong>
          ${this.activeTab === "others"
                ? `<br><small><ha-icon icon="mdi:account" style="margin-right:4px;"></ha-icon>${card.owner}</small>`
                : ""
            }
        </div>
      `).join("")}
    </div>
    ${this.selectedCard ? `
      <div class="popup">
        <h3 class="card-title">${this.selectedCard.name}</h3>
        <div class="code" id="code-preview"></div>
        <div class="button-group">
          <button id="toggle-code"><ha-icon icon="mdi:cached"></ha-icon> QR/Barcode</button>
          ${this.selectedCard.user_id === this._hass.user.id ? `
            <button id="edit"><ha-icon icon="mdi:pencil"></ha-icon> Edit</button>
            <button id="delete"><ha-icon icon="mdi:delete"></ha-icon> Delete</button>
          ` : ""}
        </div>
        <ha-icon icon="mdi:close" class="close-btn" id="close" title="Close"></ha-icon>
      </div>
    ` : ""}
  `;

        // Reattach event handlers
        this.dynamicContainer.querySelector("#tab-own")
            .addEventListener("click", () => {
                this.activeTab = "own";
                this.render();
            });
        this.dynamicContainer.querySelector("#tab-others")
            .addEventListener("click", () => {
                this.activeTab = "others";
                this.render();
            });
        this.dynamicContainer.querySelectorAll("[data-card-id]").forEach(el =>
            el.addEventListener("click", () => this.openCard(el.getAttribute("data-card-id")))
        );
        if (this.selectedCard) {
            const mode = this.viewModes[this.selectedCard.card_id] || "barcode";
            const container = this.dynamicContainer.querySelector("#code-preview");
            container.innerHTML = "";
            if (mode === "qr") {
                new QRCode(container, { text: this.selectedCard.code, width: 160, height: 160 });
            } else {
                const canvas = document.createElement("canvas");
                container.appendChild(canvas);
                const sanitizedCode = this.selectedCard.code.normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/[^a-zA-Z0-9]/g, "");
                JsBarcode(canvas, sanitizedCode, { format: "CODE128", width: 5, height: 80 });
            }
            this.dynamicContainer.querySelector("#toggle-code")
                .addEventListener("click", () => {
                    this.toggleCodeType(this.selectedCard.card_id);
                });
            this.dynamicContainer.querySelector("#close")
                .addEventListener("click", () => this.closeCard());
            if (this.selectedCard.user_id === this._hass.user.id) {
                this.dynamicContainer.querySelector("#delete")
                    .addEventListener("click", () => this.deleteCard(this.selectedCard));
                this.dynamicContainer.querySelector("#edit")
                    .addEventListener("click", () => this.updateCard(this.selectedCard));
            }
        }

        // Reset scroll position
        const newCardListEl = this.dynamicContainer.querySelector(".cardlist");
        if (newCardListEl) {
            newCardListEl.scrollTop = scrollPosition;
        }
    }
}

customElements.define("cardwallet-card", CardWalletCard);