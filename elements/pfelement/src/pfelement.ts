import { LitElement, html, css } from "lit";
import { autoReveal } from "./reveal";

export class PFElement extends LitElement {
  static _debugLog: boolean;
  static _trackPerformance: boolean;
  static _markId: string;
  _slotsObserver: MutationObserver | undefined;
  tag: string | undefined;
  pfelement: boolean | undefined;
  slots: any;

  /**
   * A boolean value that indicates if the logging should be printed to the console; used for debugging.
   * For use in a JS file or script tag; can also be added in the constructor of a component during development.
   * @example PFElement.debugLog(true);
   * @tags debug
   */
  static debugLog(preference = null) {
    if (preference !== null) {
      // wrap localStorage references in a try/catch; merely referencing it can
      // throw errors in some locked down environments
      try {
        localStorage.pfeLog = !!preference;
      } catch (e) {
        // if localStorage fails, fall back to PFElement._debugLog
        PFElement._debugLog = !!preference;
        return PFElement._debugLog;
      }
    }
    // @TODO the reference to _debugLog is for backwards compatibiilty and will be removed in 2.0
    return localStorage.pfeLog === "true" || PFElement._debugLog;
  }

  /**
   * A boolean value that indicates if the performance should be tracked.
   * For use in a JS file or script tag; can also be added in the constructor of a component during development.
   * @example PFElement._trackPerformance = true;
   */
   static trackPerformance(preference = null) {
    if (preference !== null) {
      PFElement._trackPerformance = !!preference;
    }
    return PFElement._trackPerformance;
  }

  /**
   * A logging wrapper which checks the debugLog boolean and prints to the console if true.
   *
   * @example PFElement.log("Hello");
   */
   static log(...msgs: string[]) {
    if (PFElement.debugLog()) {
      console.log(...msgs);
    }
  }

  /**
   * Local logging that outputs the tag name as a prefix automatically
   *
   * @example this.log("Hello");
   */
  log(...msgs: string[]) {
    PFElement.log(`[${this.tag}${this.id ? `#${this.id}` : ""}]`, ...msgs);
  }

  /**
   * A console warning wrapper which formats your output with useful debugging information.
   *
   * @example PFElement.warn("Hello");
   */
  static warn(...msgs: string[]) {
    console.warn(...msgs);
  }

  /**
   * Local warning wrapper that outputs the tag name as a prefix automatically.
   * For use inside a component's function.
   * @example this.warn("Hello");
   */
  warn(...msgs: string[]) {
    PFElement.warn(`[${this.constructor.tag}${this.id ? `#${this.id}` : ``}]`, ...msgs);
  }

  /**
   * A console error wrapper which formats your output with useful debugging information.
   * For use inside a component's function.
   * @example PFElement.error("Hello");
   */
  static error(...msgs: string[]) {
    throw new Error([...msgs].join(" "));
  }

  /**
   * Local error wrapper that outputs the tag name as a prefix automatically.
   * For use inside a component's function.
   * @example this.error("Hello");
   */
  error(...msgs: string[]) {
    PFElement.error(`[${this.tag}${this.id ? `#${this.id}` : ``}]`, ...msgs);
  }

  protected get properties() {
    return {
      pfelement: {
        type: Boolean,
        reflect: true
      }
    }
  }

  /**
   * A global definition of component types (a general way of defining the purpose of a
   * component and how it is put together).
   */
  static get PfeTypes() {
    return {
      Container: "container",
      Content: "content",
      Combo: "combo",
    };
  }

  /**
   * The current version of a component; set by the compiler using the package.json data.
   */
  static get version() {
    return "{{version}}";
  }

  /**
   * Breakpoint object mapping human-readable size names to viewport sizes
   * To overwrite this at the component-level, include `static get breakpoint` in your component's class definition
   * @returns {Object} keys are t-shirt sizes and values map to screen-sizes (sourced from PF4)
   */
   static get breakpoint() {
    return {
      xs: "0px", // $pf-global--breakpoint--xs: 0 !default;
      sm: "576px", // $pf-global--breakpoint--sm: 576px !default;
      md: "768px", // $pf-global--breakpoint--md: 768px !default;
      lg: "992px", // $pf-global--breakpoint--lg: 992px !default;
      xl: "1200px", // $pf-global--breakpoint--xl: 1200px !default;
      "2xl": "1450px", // $pf-global--breakpoint--2xl: 1450px !default;
    };
  }

  /**
   * Returns a boolean statement of whether or not this component contains any light DOM.
   * @returns {boolean}
   * @example if(this.hasLightDOM()) this._init();
   */
   hasLightDOM(): boolean {
    return this.children.length > 0 || this.textContent.trim().length > 0;
  }

  static create(pfe: any) {
    window.customElements.define(pfe.tag, pfe);

    if (PFElement.trackPerformance()) {
      try {
        performance.mark(`${this._markId}-defined`);
      } catch (err) {
        this.log(`Performance marks are not supported by this browser.`);
      }
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.pfelement = true;
    // this.setAttribute("pfelement", "");

    // If the slot definition exists, set up an observer
    // NOTE: not sure why I needed to switch to this.constructor.slots
    if (typeof this.constructor.slots === "object") {
      this._slotsObserver = new MutationObserver(() => this._initializeSlots(this.constructor.tag, this.constructor.slots));
      this._initializeSlots(this.constructor.tag, this.constructor.slots);
    }
  }

  /**
   * Standard disconnected callback; fires when a componet is removed from the DOM.
   * Add your removeEventListeners here.
   */
   disconnectedCallback() {
    // if (this._cascadeObserver) this._cascadeObserver.disconnect();
    if (this._slotsObserver) this._slotsObserver.disconnect();

    // // Remove this instance from the pointer
    // const classIdx = this._pfeClass.instances.find((item) => item !== this);
    // delete this._pfeClass.instances[classIdx];

    // const globalIdx = PFElement.allInstances.find((item) => item !== this);
    // delete PFElement.allInstances[globalIdx];
  }

  /**
   * Maps the defined slots into an object that is easier to query
   */
   _initializeSlots(tag: string, slots: any) {
    this.log("Validate slots...");

    if (this._slotsObserver) this._slotsObserver.disconnect();

    // Loop over the properties provided by the schema
    Object.keys(slots).forEach((slot) => {
      let slotObj = slots[slot];

      // Only attach the information if the data provided is a schema object
      if (typeof slotObj === "object") {
        let slotExists = false;
        let result = [];
        // If it's a named slot, look for that slot definition
        if (slotObj.namedSlot) {
          // Check prefixed slots
          result = this.getSlot(`${tag}--${slot}`);
          if (result.length > 0) {
            slotObj.nodes = result;
            slotExists = true;
          }

          // Check for unprefixed slots
          result = this.getSlot(`${slot}`);
          if (result.length > 0) {
            slotObj.nodes = result;
            slotExists = true;
          }
          // If it's the default slot, look for direct children not assigned to a slot
        } else {
          result = [...this.children].filter((child) => !child.hasAttribute("slot"));

          if (result.length > 0) {
            slotObj.nodes = result;
            slotExists = true;
          }
        }

        // If the slot exists, attach an attribute to the parent to indicate that
        if (slotExists) {
          this.setAttribute(`has_${slot}`, "");
        } else {
          this.removeAttribute(`has_${slot}`);
        }
      }
    });

    this.log("Slots validated.");

    if (this._slotsObserver) this._slotsObserver.observe(this, { childList: true });
  }

  /**
   * Returns a boolean statement of whether or not that slot exists in the light DOM.
   *
   * @param {String|Array} name The slot name.
   * @example this.hasSlot("header");
   */
   hasSlot(name) {
    if (!name) {
      this.warn(`Please provide at least one slot name for which to search.`);
      return;
    }

    if (typeof name === "string") {
      return (
        [...this.children].filter((child) => child.hasAttribute("slot") && child.getAttribute("slot") === name).length >
        0
      );
    } else if (Array.isArray(name)) {
      return name.reduce(
        (n) =>
          [...this.children].filter((child) => child.hasAttribute("slot") && child.getAttribute("slot") === n).length >
          0
      );
    } else {
      this.warn(`Expected hasSlot argument to be a string or an array, but it was given: ${typeof name}.`);
      return;
    }
  }

  /**
   * Given a slot name, returns elements assigned to the slot as an arry.
   * If no value is provided (i.e., `this.getSlot()`), it returns all children not assigned to a slot (without a slot attribute).
   *
   * @example: `this.getSlot("header")`
   */
  getSlot(name = "unassigned") {
    if (name !== "unassigned") {
      return [...this.children].filter((child) => child.hasAttribute("slot") && child.getAttribute("slot") === name);
    } else {
      return [...this.children].filter((child) => !child.hasAttribute("slot"));
    }
  }

  cssVariable(name, value, element = this) {
    name = name.substr(0, 2) !== "--" ? "--" + name : name;
    if (value) {
      element.style.setProperty(name, value);
      return value;
    }
    return window.getComputedStyle(element).getPropertyValue(name).trim() || null;
  }

  /**
   * A wrapper around an event dispatch to standardize formatting.
   */
   emitEvent(name: string, { bubbles = true, cancelable = false, composed = true, detail = {} } = {}) {
    // @todo: throwing the following error:
    //        TypeError: Converting circular structure to JSON
    // if (detail) this.log(`Custom event: ${name}`, JSON.stringify(detail));
    this.log(`Custom event: ${name}`);

    this.dispatchEvent(
      new CustomEvent(name, {
        bubbles,
        cancelable,
        composed,
        detail,
      })
    );
  }
}

autoReveal(PFElement.log);

export { html, css };