import { expect, elementUpdated } from "@open-wc/testing/index-no-side-effects";
import { spy } from "sinon";
import { createFixture } from "../../../test/utils/create-fixture";
import { PfeMarkdown } from "../dist/pfe-markdown.js";

const element = `
<pfe-markdown id="original">
  <div pfe-markdown-container># pfe-markdown</div>
</pfe-markdown>
`;

const dynamic = `
<pfe-markdown id="dynamic">
  <div pfe-markdown-container></div>
</pfe-markdown>
`;

describe("<pfe-markdown>", () => {
  it("should upgrade", async () => {
    const el = await createFixture(element);
    expect(el).to.be.an.instanceOf(customElements.get(PfeMarkdown.tag), "pfe-markdown should be an instance of PfeMarkdown");
  });

  it("it should take markdown from the pfe-markdown-container and format it in the pfe-markdown-render div", async () => {
    const el = await createFixture(element);
    const markdownRender = el.querySelector("[pfe-markdown-render]");
    const markdown = markdownRender.innerHTML.trim();
    expect(markdown).to.equal(`<h1 id="pfe-markdown">pfe-markdown</h1>`);
  });

  it("it should render as markdown any dynamically added markdown in the pfe-markdown-container div", async () => {
    const el = await createFixture(dynamic);
    const markdownText = "# Dynamic Markdown";

    el.querySelector("[pfe-markdown-container]").innerHTML = markdownText;
    await elementUpdated(el);
    const markdownRender = el.querySelector("[pfe-markdown-render]");
    const markdown = markdownRender.innerHTML.trim();
    expect(markdown).to.equal(`<h1 id="dynamic-markdown">Dynamic Markdown</h1>`);
  });

  it("it should render any additional markdown added to the light dom", async () => {
    const el = await createFixture(element);
    const markdownRender = el.querySelector("[pfe-markdown-render]");
    const markdown = markdownRender.innerHTML.trim();
    await elementUpdated(el);
    expect(markdown).to.equal(`<h1 id="pfe-markdown">pfe-markdown</h1>`);

    el.querySelector("[pfe-markdown-container]").innerHTML += `\n## Heading Level 2`;
    await elementUpdated(el);
    const updatedMarkdown = el.querySelector("[pfe-markdown-render]").innerHTML.trim();
    expect(updatedMarkdown).to.equal(
      `<h1 id="pfe-markdown">pfe-markdown</h1>
<h2 id="heading-level-2">Heading Level 2</h2>`
    );
  });

  it("it should clear the markdown render if markdown container innerHTML is removed", async () => {
    const el = await createFixture(element);
    el.querySelector("[pfe-markdown-container]").innerHTML = "";
    await elementUpdated(el);
    const markdownRender = el.querySelector("[pfe-markdown-render]");
    const markdownElementInnerHTML = markdownRender.innerHTML.trim();
    expect(markdownElementInnerHTML).to.equal("");
  });
});