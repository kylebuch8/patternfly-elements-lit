import { expect, elementUpdated } from "@open-wc/testing/index-no-side-effects";
import { spy } from "sinon";
import { createFixture } from "../../../test/utils/create-fixture";
import { PfeClipboard } from "../dist/pfe-clipboard.js";

const hexToRgb = hex => {
  const [, r, g, b] = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})/.exec(hex);
    return [
        parseInt(r, 16),
        parseInt(g, 16),
        parseInt(b, 16)
      ];
};

const slots = {
  icon: {
      name: "icon",
      class: "pfe-clipboard__icon",
      defaultContent: `<svgxmlns="http://www.w3.org/2000/svg"width="16"height="16"viewBox="0015.27716"><gtransform="translate(-2.077-1.807)"><pathclass="a"d="M15.34,2.879a3.86,3.86,0,0,0-5.339,0L6.347,6.545a3.769,3.769,0,0,0,0,5.339.81.81,0,0,0,1.132,0,.823.823,0,0,0,0-1.145A2.144,2.144,0,0,1,7.5,7.677l3.641-3.654a2.161,2.161,0,1,1,3.049,3.062l-.8.8a.811.811,0,1,0,1.145,1.132l.8-.8a3.769,3.769,0,0,0,0-5.339Z"transform="translate(0.9060)"></path><pathclass="a"d="M10.482,6.822a.823.823,0,0,0,0,1.145,2.161,2.161,0,0,1,0,3.049L7.343,14.155a2.161,2.161,0,0,1-3.062,0,2.187,2.187,0,0,1,0-3.062l.193-.116a.823.823,0,0,0,0-1.145.811.811,0,0,0-1.132,0l-.193.193a3.86,3.86,0,0,0,0,5.339,3.86,3.86,0,0,0,5.339,0l3.126-3.139A3.731,3.731,0,0,0,12.72,9.562a3.769,3.769,0,0,0-1.094-2.74A.823.823,0,0,0,10.482,6.822Z"transform="translate(01.37)"></path></g></svg>`
  },
  text: {
      name: "text",
      class: "pfe-clipboard__text",
      defaultContent: "Copy URL"
  },
  textSuccess: {
      name: "text--success",
      class: "pfe-clipboard__text--success",
      defaultContent: "Copied"
  }
}

const element = `
  <pfe-clipboard></pfe-clipboard>
`;

describe("<pfe-clipboard>", async () => {
  it("should upgrade", async () => {
    const el = await createFixture(element);
    expect(el).to.be.an.instanceOf(customElements.get(PfeClipboard.tag), "pfe-clipboard should be an instance of PfeClipboard");
  });

  it("should render the default slot content.", async () => {
    const el = await createFixture(element);
    expect(el.shadowRoot.querySelector(`#text`).textContent).to.equal(slots.text.defaultContent);
    expect(el.shadowRoot.querySelector(`#text--success`).textContent).to.equal(slots.textSuccess.defaultContent);
    expect(el.shadowRoot.querySelector(`#icon`).innerHTML.replace(/\s/g, "")).to.equal(slots.icon.defaultContent);
  });

  it("it should render slot overrides", async () => {
    const el = await createFixture(element);
    // The default slot override will be handled by transposeSlot
    const defaultSlot = `<span slot="text">You can totally click to copy url</span>`;
    const textSuccessSlot = `<span slot="text--success">Making some copies!</span>`;
    const iconSlot = `<pfe-icon slot="icon" icon="web-icon-globe" color="darker"></pfe-icon>`;
    el.innerHTML = `
        ${defaultSlot}
        ${textSuccessSlot}
        ${iconSlot}
    `;
    // transposeSlot should have sent it to the text named slot
    expect(el.shadowRoot.querySelector(`#text`).assignedNodes({ flatten: true }).map(i => i.outerHTML.trim()).join("")).to.equal(defaultSlot);
    // The text--success and icon slots should be working as expected also
    expect(el.shadowRoot.querySelector(`#text--success`).assignedNodes({ flatten: true }).map(i => i.outerHTML.trim()).join("")).to.equal(textSuccessSlot);
    expect(el.shadowRoot.querySelector(`#icon`).assignedNodes({ flatten: true }).map(i => i.outerHTML.trim()).join("")).to.equal(iconSlot);
  });

  it(`should hide the icon when the no-icon attribute set.`, async () => {
    const el = await createFixture(element);
    // Activate the no-icon boolean property
    el.setAttribute("no-icon", true);
    // wait for setAttribute to apply
    await elementUpdated(el);
    expect(el.shadowRoot.querySelector(`#icon`)).to.equal(null);
  });

  it(`should have the correct text color settings for both copied and non-copied states`, async () => {
    const el = await createFixture(element);
    // Default text should be set the link variable
    expect(getComputedStyle(el.shadowRoot.querySelector(`.pfe-clipboard__text`), null)["color"]).to.equal(`rgb(${hexToRgb("#0066cc").join(', ')})`);
    // Default text should be set the feedback--success variable
    expect(getComputedStyle(el.shadowRoot.querySelector(`.pfe-clipboard__text--success`), null)["color"]).to.equal(`rgb(${hexToRgb("#3e8635").join(', ')})`);
  });

  it('should fire a pfe-clipboard:copied event when clicked', async () => {
    const el = await createFixture(element);
    const handlerSpy = spy();
    window.focus();
    // Add global event listener for the copy event
    document.querySelector("body").addEventListener('pfe-clipboard:copied', handlerSpy);
    // Simulate click
    el.click();
    await elementUpdated(el);
    // Get the event from the event listener callback
    const [event] = handlerSpy.getCall(0).args;
    // Make sure it was called only once
    expect(handlerSpy.calledOnce).to.be.true;
    expect(event.detail.url).to.not.be.empty;
    document.removeEventListener("pfe-clipboard:click", handlerSpy);
  });

  it(`should have the correct accessibility attributes`, async () => {
    const el = await createFixture(element);
    // Add global event listener for the copy event
    expect(el.getAttribute("role")).to.equal("button");
    expect(el.getAttribute("tabindex")).to.equal("0");
  });

  it(`it should display the text--success state for 3 seconds`, async () => {
    const el = await createFixture(element);
    el.click();
    await elementUpdated(el);
    // There should be a copied attribute on the host
    expect(el.hasAttribute("copied")).to.equal(true);
    // The text should be hidden
    expect(getComputedStyle(el.shadowRoot.querySelector(`.pfe-clipboard__text`), null)["display"]).to.equal("none");
    // The text--success should be visible
    expect(getComputedStyle(el.shadowRoot.querySelector(`.pfe-clipboard__text--success`), null)["display"]).to.equal("block");
    // @todo find out how to wait for these timeout tests
    // after 3 seconds it should return to normal
    //     setTimeout(() => {
    //         // There should be a copied attribute on the host
    //         assert.equal(clipboardStylesTest.hasAttribute("copied"), false);
    //         // The text should be hidden
    //         assert.equal(getComputedStyle(clipboardStylesTest.shadowRoot.querySelector(`.pfe-clipboard__text`), null)["display"], "block");
    //         // The text--success should be visible
    //         assert.equal(getComputedStyle(clipboardStylesTest.shadowRoot.querySelector(`.pfe-clipboard__text--success`), null)["display"], "none");
    //         done();
    //     }, 3001);
  });

  it(`should have a customizable copied state duration.`, async () => {
    const el = await createFixture(element);
    el.setAttribute("copied-duration", "1");
    await elementUpdated(el);
    // Set the copied state duration to 1 second
    el.click();
    await elementUpdated(el);
    // @todo find out how to wait for these timeout tests
    // Check to see if the success text
    // setTimeout(() => {
    //   expect(getComputedStyle(el.shadowRoot.querySelector(`.pfe-clipboard__text--success`), null)["display"]).to.equal("block");
    // }, 0);
    // setTimeout(() => {
    //   expect(getComputedStyle(el.shadowRoot.querySelector(`.pfe-clipboard__text--success`), null)["display"]).to.equal("none");
    //   done();
    // }, 1500);
  });
});