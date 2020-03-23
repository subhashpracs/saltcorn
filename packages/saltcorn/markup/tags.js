const rmFalse = vs =>
  vs.filter(v => v !== false && v !== null && typeof v !== "undefined");

const mkTag = tnm => (...args) => {
  var body = "";
  var attribs = " ";
  const ppAttrib = kv =>
    typeof kv[1] === "boolean" ? (kv[1] ? kv[0] : "") : `${kv[0]}="${kv[1]}"`;
  args.forEach(arg => {
    if (typeof arg === "undefined" || arg === null || arg === false) {
      //do nothing
    } else if (typeof arg === "string") {
      body += arg;
    } else if (typeof arg === "object") {
      if (!Array.isArray(arg)) {
        attribs += Object.entries(arg)
          .map(ppAttrib)
          .join(" ");
      } else {
        body += rmFalse(arg).join("");
      }
    } else body += arg;
  });
  if (attribs === " ") attribs = "";
  return body.length > 0
    ? `<${tnm}${attribs}>${body}</${tnm}>`
    : `<${tnm}${attribs} />`;
};
const input = kvs => {
  const attribs = Object.entries(kvs)
    .map(kv => `${kv[0]}="${kv[1]}"`)
    .join(" ");
  return `<input ${attribs}>`;
};

const domReady = js => `$(function(){${js}})`;

module.exports = {
  a: mkTag("a"),
  div: mkTag("div"),
  span: mkTag("span"),
  label: mkTag("label"),
  option: mkTag("option"),
  select: mkTag("select"),
  button: mkTag("button"),
  form: mkTag("form"),
  script: mkTag("script"),
  p: mkTag("p"),
  table: mkTag("table"),
  thead: mkTag("thead"),
  tbody: mkTag("tbody"),
  tr: mkTag("tr"),
  th: mkTag("th"),
  td: mkTag("td"),
  ul: mkTag("ul"),
  li: mkTag("li"),
  h1: mkTag("h1"),
  h2: mkTag("h2"),
  h3: mkTag("h3"),
  i: mkTag("i"),
  domReady,
  input
};
