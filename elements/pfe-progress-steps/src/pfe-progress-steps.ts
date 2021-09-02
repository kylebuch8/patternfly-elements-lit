import { PFElement, html } from "@patternfly/pfelement";
import styles from "./pfe-progress-steps.scss";
import "./pfe-progress-steps-item.js";

export class PfeProgressSteps extends PFElement {
  static styles = styles;

  static get tag() {
    return "pfe-progress-steps";
  }

  static get properties() {
    return {
      vertical: {
        type: Boolean,
        reflect: true
      }
    };
  }

  constructor() {
    super();
    this.vertical = false;
    this._resizeObserver = new ResizeObserver(this._build.bind(this));
  }

  firstUpdated() {
    // this will call _build initially and estabilish a resize observer for this element
    this._resizeObserver.observe(this);
  }

  disconnectedCallback() {
    super.connectedCallback();
    this._resizeObserver.disconnect();
  }

  updated(changedProperties) {
    changedProperties.forEach((oldValue, property) => {
      if (property === "vertical") {
        [...this.querySelectorAll("pfe-progress-steps-item")].forEach(element => element.vertical = this.vertical);
      }
    });
  }

  _build() {
    const items = [...this.querySelectorAll("pfe-progress-steps-item")];

    // find what child item has the active state
    const activeItemIndex = items.findIndex((element) => element.current);
    if (activeItemIndex >= 0) {
      // Calculate the size of the progress bar.
      const size = (activeItemIndex / (items.length - 1)) * 100 + "%";
      const dimension = this.vertical ? "height" : "width";
      this.shadowRoot.querySelector(`.pfe-progress-steps__progress-bar--fill`).style[dimension] = size;
    }

    for (let index = 0; index < items.length; index++) {
      const item = items[index];

      if (!this.vertical) {
        Promise.all([customElements.whenDefined(item.tagName.toLowerCase())]).then(() => {
          if (index === 0) {
            this.style.setProperty(
              `--pfe-progress-steps__item--size--first`,
              `${parseInt(item.getBoundingClientRect().width)}px`
            );
          } else if (index === items.length - 1) {
            this.style.setProperty(
              `--pfe-progress-steps__item--size--last`,
              `${parseInt(item.getBoundingClientRect().width)}px`
            );
          }
        });
      }

      // Add spacing to the each of the items except for the top item
      // @todo we have to do it in javascript until everyone supports
      // targeting siblings in :slotted. i.e. slot:slotted(pfe-progress-steps-item + pfe-progress-steps-item) { margin-top }
      else {
        // if it's the last item then we'll explicitly set the min-height
        // to 0 so the circle and lines stop at the top of the last item.
        if (index === items.length - 1) item.style.minHeight = "0";
        // if it's not the last item then unset any inline min-height style
        // that was set.
        else item.style.minHeight = "";
      }
    }
  }

  render() {
    return html`
      <div class="pfe-progress-steps__progress-bar">
        <span class="pfe-progress-steps__progress-bar--fill"></span>
      </div>
      <slot></slot>
    `;
  }
}

PFElement.create(PfeProgressSteps);