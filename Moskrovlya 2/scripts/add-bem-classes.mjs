import { readFileSync, writeFileSync } from "node:fs";
import { parse, serialize } from "parse5";

const file = new URL("../index.html", import.meta.url);
const documentNode = parse(readFileSync(file, "utf8"));
const stateClasses = new Set(["active", "close", "disabled", "hide", "mobile", "open", "shadow"]);
const ignoredAsNames = new Set([
  "active", "block", "close", "container", "disabled", "fx", "fxa", "hide", "left", "mobile",
  "mdelete", "right", "shadow", "w100", "wrap",
]);

const blockRules = [
  ["logo_block", "site-header"],
  ["menu_top", "primary-nav"],
  ["header_index", "hero"],
  ["main_index", "roofing-page"],
  ["footer", "site-footer"],
  ["burger_menu", "mobile-menu"],
  ["landing_marquiz", "express-quiz"],
  ["survey_marquiz", "roof-quiz"],
  ["survey", "roof-quiz"],
  ["portfolio_main", "roofing-gallery"],
  ["main_otzyv", "reviews-slider"],
  ["portfolio_main_dom", "projects-gallery"],
];

const tagNames = {
  a: "link",
  article: "article",
  aside: "aside",
  b: "emphasis",
  br: "line-break",
  button: "button",
  div: "container",
  fieldset: "fieldset",
  footer: "footer",
  form: "form",
  h1: "heading",
  h2: "heading",
  h3: "heading",
  h4: "heading",
  header: "header",
  img: "image",
  input: "input",
  label: "label",
  li: "item",
  main: "main",
  nav: "navigation",
  ol: "list",
  option: "option",
  p: "paragraph",
  section: "section",
  select: "select",
  small: "caption",
  span: "text",
  strong: "emphasis",
  svg: "icon",
  path: "icon-path",
  textarea: "textarea",
  ul: "list",
};

function getAttribute(node, name) {
  return node.attrs?.find((attribute) => attribute.name === name)?.value || "";
}

function setClassNames(node, names) {
  const value = [...new Set(names.filter(Boolean))].join(" ");
  const attribute = node.attrs?.find((item) => item.name === "class");
  if (attribute) attribute.value = value;
  else (node.attrs ||= []).push({ name: "class", value });
}

function normalize(value) {
  return value
    .replace(/__/g, "-")
    .replace(/_/g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "-")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function findOwnBlock(classes) {
  for (const [sourceClass, block] of blockRules) {
    if (classes.includes(sourceClass)) return block;
  }
  return null;
}

function getElementName(node, classes) {
  const meaningful = classes.find((className) => {
    const normalized = normalize(className);
    return normalized && !ignoredAsNames.has(normalized) && !stateClasses.has(normalized) && !normalized.includes("--");
  });
  return normalize(meaningful || tagNames[node.tagName] || node.tagName || "element");
}

let coveredElements = 0;

function visit(node, inheritedBlock = "page") {
  if (!node.tagName) {
    for (const child of node.childNodes || []) visit(child, inheritedBlock);
    return;
  }

  if (["script", "style", "template"].includes(node.tagName)) return;

  const classes = getAttribute(node, "class").split(/\s+/).filter(Boolean);
  const ownBlock = findOwnBlock(classes);
  const block = ownBlock || inheritedBlock;
  const element = getElementName(node, classes);
  const bemClass = ownBlock ? block : `${block}__${element}`;
  const modifiers = classes
    .map(normalize)
    .filter((className) => stateClasses.has(className))
    .map((modifier) => `${bemClass}--${modifier}`);

  setClassNames(node, [...classes, bemClass, ...modifiers]);
  coveredElements += 1;

  for (const child of node.childNodes || []) visit(child, block);
}

const htmlNode = documentNode.childNodes.find((node) => node.tagName === "html");
const bodyNode = htmlNode?.childNodes.find((node) => node.tagName === "body");
if (!bodyNode) throw new Error("Body element not found");

setClassNames(bodyNode, [...getAttribute(bodyNode, "class").split(/\s+/).filter(Boolean), "page"]);
for (const child of bodyNode.childNodes || []) visit(child, "page");

writeFileSync(file, serialize(documentNode), "utf8");
console.log(`BEM classes added to ${coveredElements + 1} body elements`);
