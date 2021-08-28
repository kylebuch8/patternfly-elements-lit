import { PFElement, html } from "@patternfly/pfelement";
import styles from "pfe-modal.scss";

export class PfeModal extends PFElement {
  static styles = styles;

  static get tag() {
    return "pfe-modal";
  }

  static get events() {
    return {
      open: `${this.tag}:open`,
      close: `${this.tag}:close`,
    };
  }

  constructor() {
    super();

    this.header_id = this.randomId;
    this.isOpen = false;
  }

  firstUpdated() {
    // store references
    this._modalWindow = this.shadowRoot.querySelector(`.${this.constructor.tag}__window`);
    this._modalCloseButton = this.shadowRoot.querySelector(`.${this.constructor.tag}__close`);
    this._overlay = this.shadowRoot.querySelector(`.${this.constructor.tag}__overlay`);
    this._container = this.shadowRoot.querySelector(`.${this.constructor.tag}__container`);
    this._outer = this.shadowRoot.querySelector(`.${this.constructor.tag}__outer`);
    // event listeners
    this.addEventListener("keydown", this._keydownHandler.bind(this));
    this._modalCloseButton.addEventListener("keydown", this._keydownHandler.bind(this));
    this._modalCloseButton.addEventListener("click", this.close.bind(this));
    this._overlay.addEventListener("click", this.close.bind(this));
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    this.removeEventListener("keydown", this._keydownHandler.bind(this));
    this._modalCloseButton.removeEventListener("click", this.close.bind(this));
    this._modalCloseButton.removeEventListener("click", this.close.bind(this));
    this._overlay.removeEventListener("click", this.close.bind(this));

    if (this.trigger) {
      this.trigger.removeEventListener("click", this.open.bind(this));
    }
  }

  _keydownHandler(event) {
    let target = event.target || window.event.srcElement;
    let key = event.key || event.keyCode;
    switch (key) {
      case "Tab":
      case 9:
        if (target === this._modalCloseButton) {
          event.preventDefault();
          this._modalWindow.focus();
        }
        return;
      case "Escape":
      case "Esc":
      case 27:
        this.close(event);
        return;
      case "Enter":
      case 13:
        if (target === this.trigger) {
          this.open(event);
        }
        return;
    }
  }

  toggle(event) {
    this.isOpen ? this.close(event) : this.open(event);
    return this;
  }

  open(event) {
    if (event) {
      event.preventDefault();
      this.trigger = event ? event.target : window.event.srcElement;
    }

    const detail = {
      open: true,
    };

    if (event && this.trigger) {
      detail.trigger = this.trigger;
    }

    this.isOpen = true;
    // Reveal the container and overlay
    this._modalWindow.removeAttribute("hidden");
    this._overlay.removeAttribute("hidden");
    this._outer.removeAttribute("hidden");
    // This prevents background scroll
    document.body.style.overflow = "hidden";
    // Set the focus to the container
    this._modalWindow.focus();

    this.emitEvent(PfeModal.events.open, { detail });

    return this;
  }

  close(event) {
    if (event) {
      event.preventDefault();
    }

    this.isOpen = false;
    // Hide the container and overlay
    this._modalWindow.setAttribute("hidden", true);
    this._overlay.setAttribute("hidden", true);
    this._outer.setAttribute("hidden", true);
    // Return scrollability
    document.body.style.overflow = "auto";

    if (this.trigger) {
      // Move focus back to the trigger element
      this.trigger.focus();
      this.trigger = null;
    }

    this.emitEvent(PfeModal.events.close, {
      detail: {
        open: false,
      },
    });

    return this;
  }

  render() {
    return html`
      <span class="pfe-modal__trigger" @click=${this.open}>
        <slot name="pfe-modal--trigger"></slot>
      </span>
      <section class="pfe-modal__outer" hidden>
        <div class="pfe-modal__overlay" @click=${this.toggle}></div>
        <div class="pfe-modal__window" tabindex="0" role="dialog" hidden>
          <div class="pfe-modal__container">
            <div class="pfe-modal__content">
              <slot name="pfe-modal--header"></slot>
              <slot></slot>
            </div>
            <button class="pfe-modal__close" aria-label="Close dialog">
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="32" height="32" viewBox="-11 11 22 23">
                <path d="M30 16.669v-1.331c0-0.363-0.131-0.675-0.394-0.938s-0.575-0.394-0.938-0.394h-10.669v-10.65c0-0.362-0.131-0.675-0.394-0.938s-0.575-0.394-0.938-0.394h-1.331c-0.363 0-0.675 0.131-0.938 0.394s-0.394 0.575-0.394 0.938v10.644h-10.675c-0.362 0-0.675 0.131-0.938 0.394s-0.394 0.575-0.394 0.938v1.331c0 0.363 0.131 0.675 0.394 0.938s0.575 0.394 0.938 0.394h10.669v10.644c0 0.363 0.131 0.675 0.394 0.938 0.262 0.262 0.575 0.394 0.938 0.394h1.331c0.363 0 0.675-0.131 0.938-0.394s0.394-0.575 0.394-0.938v-10.637h10.669c0.363 0 0.675-0.131 0.938-0.394 0.269-0.262 0.4-0.575 0.4-0.938z" transform="rotate(45)"/>
              </svg>
            </button>
          </div>
        </div>
      </section>
    `;
  }
}

PFElement.create(PfeModal);