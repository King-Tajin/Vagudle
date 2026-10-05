import { Marked } from "marked";
import { gfmHeadingId } from "marked-gfm-heading-id";
import ZeroMdBase from "zero-md/src/zero-md-base.js";
import "./docs.css";
import docsMdCss from "./docs-md.css?inline";

const DOC_ID = /^[a-z0-9_-]+$/i;
const DOC_LINK = /^([a-z0-9_-]+)\.md(#.*)?$/i;

// noinspection JSUnusedGlobalSymbols
class DocsMd extends ZeroMdBase {
  async load() {
    this.template = `<style>${docsMdCss}</style>`;
    this.parser = new Marked({ gfm: true });
    this.parser.use(gfmHeadingId(), {
      renderer: {
        link({ href, title, tokens }) {
          const match = DOC_LINK.exec(href);
          if (!match) return false;
          const target = `/docs/?doc=${match[1]}${match[2] ?? ""}`;
          // noinspection JSUnresolvedReference
          const label = this.parser.parseInline(tokens);
          const titleAttr = title
            ? ` title="${title.replace(/&/g, "&amp;").replace(/"/g, "&quot;")}"`
            : "";
          return `<a href="${target}"${titleAttr}>${label}</a>`;
        },
      },
    });
  }

  async parse({ text }) {
    return this.parser.parse(text);
  }
}

customElements.define("zero-md", DocsMd);

const $ = (id) => document.getElementById(id);

const setStatus = (message, backLink = false) => {
  const status = $("status");
  status.textContent = message;
  status.hidden = false;
  if (backLink) {
    const link = document.createElement("a");
    link.href = "/docs/";
    link.textContent = " Back to all docs.";
    status.append(link);
  }
};

const fetchText = async (url) => {
  try {
    const response = await fetch(url);
    const type = response.headers.get("content-type") ?? "";
    if (!response.ok || type.includes("text/html")) return null;
    return await response.text();
  } catch {
    return null;
  }
};

const loadManifest = async () => {
  const text = await fetchText("/docs/docs.json");
  if (text === null) return [];
  try {
    const data = JSON.parse(text);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

const showSidebar = (visible) => {
  $("sidebar").hidden = !visible;
  document.querySelector(".layout").classList.toggle("has-sidebar", visible);
};

const showIndex = (docs) => {
  if (docs.length === 0) {
    setStatus("No documents yet.");
    return;
  }
  const list = $("index-list");
  for (const doc of docs) {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = `/docs/?doc=${encodeURIComponent(doc.id)}`;
    const title = document.createElement("strong");
    title.textContent = doc.title ?? doc.id;
    const description = document.createElement("span");
    description.textContent = doc.description ?? "";
    link.append(title, description);
    item.append(link);
    list.append(item);
  }
  $("status").hidden = true;
  $("index-view").hidden = false;
};

const fillDocsNav = (docs, currentId) => {
  if (docs.length < 2) return;
  const list = $("docs-list");
  for (const doc of docs) {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = `/docs/?doc=${encodeURIComponent(doc.id)}`;
    link.textContent = doc.title ?? doc.id;
    if (doc.id === currentId) link.setAttribute("aria-current", "page");
    item.append(link);
    list.append(item);
  }
  $("docs-nav").hidden = false;
};

const fillToc = (element, docId) => {
  const headings = element.shadowRoot.querySelectorAll("h2, h3");
  if (headings.length === 0) return;
  const toc = $("toc");
  const desktop = matchMedia("(min-width: 900px)");
  toc.open = desktop.matches;
  desktop.addEventListener("change", () => {
    toc.open = desktop.matches;
  });
  const list = $("toc-list");
  for (const heading of headings) {
    const item = document.createElement("li");
    if (heading.tagName === "H3") item.className = "sub";
    const link = document.createElement("a");
    link.href = `?doc=${encodeURIComponent(docId)}#${heading.id}`;
    link.textContent = heading.textContent;
    link.addEventListener("click", (event) => {
      event.preventDefault();
      element.goto(heading.id);
      if (!desktop.matches) toc.open = false;
      history.replaceState(
        null,
        "",
        `${location.pathname}${location.search}#${heading.id}`
      );
    });
    item.append(link);
    list.append(item);
  }
  toc.hidden = false;
};

const COPY_LABEL = "COPY";
const COPY_RESET_MS = 1500;

const addCopyButtons = (element) => {
  for (const pre of element.shadowRoot.querySelectorAll("pre")) {
    const wrapper = document.createElement("div");
    wrapper.className = "code-block";
    const button = document.createElement("button");
    button.type = "button";
    button.className = "copy-button";
    button.textContent = COPY_LABEL;
    button.setAttribute("aria-label", "Copy code");
    let timer = 0;
    button.addEventListener("click", async () => {
      const text = pre.querySelector("code")?.textContent ?? pre.textContent;
      try {
        await navigator.clipboard.writeText(text);
        button.textContent = "COPIED";
      } catch {
        button.textContent = "FAILED";
      }
      clearTimeout(timer);
      timer = setTimeout(() => {
        button.textContent = COPY_LABEL;
      }, COPY_RESET_MS);
    });
    pre.replaceWith(wrapper);
    wrapper.append(pre, button);
  }
};

const whenReady = (element) =>
  element.ready
    ? Promise.resolve()
    : new Promise((resolve) =>
        element.addEventListener("zero-md-ready", resolve, { once: true })
      );

const showDoc = async (docId, docs) => {
  const text = await fetchText(`/docs/${docId}.md`);
  if (text === null) {
    setStatus("Document not found.", true);
    return;
  }

  const element = new DocsMd();
  element.id = "doc";
  element.setAttribute("no-auto", "");
  const source = document.createElement("script");
  source.type = "text/markdown";
  source.textContent = text;
  element.append(source);
  const view = $("doc-view");
  view.append(element);

  await whenReady(element);
  $("status").hidden = true;
  view.hidden = false;
  await element.render();
  addCopyButtons(element);

  const heading = /^#\s+(.+)$/m.exec(text);
  if (heading) document.title = `${heading[1]} – Vagudle Docs`;

  const alternate = document.createElement("link");
  alternate.rel = "alternate";
  alternate.type = "text/markdown";
  alternate.href = `/docs/${docId}.md`;
  document.head.append(alternate);

  const raw = $("raw-link");
  raw.href = `/docs/${docId}.md`;
  raw.hidden = false;

  fillDocsNav(docs, docId);
  fillToc(element, docId);
  showSidebar(true);

  // noinspection JSUnresolvedReference
  if (location.hash) element.goto(location.hash);
};

const start = async () => {
  const docs = await loadManifest();
  const docId = new URLSearchParams(location.search).get("doc");

  if (docId === null) {
    showIndex(docs);
    return;
  }
  if (!DOC_ID.test(docId)) {
    setStatus("Document not found.", true);
    return;
  }
  await showDoc(docId, docs);
};

void start();
