let currentObserver = null;

export const Fragment = Symbol("Fragment");

export function setSignal(value) {
  const subscribers = new Set();
  const read = () => {
    if (currentObserver) subscribers.add(currentObserver);
    return value;
  };
  const write = (newValue) => {
    value = typeof newValue === "function" ? newValue(value) : newValue;
    subscribers.forEach((fn) => fn());
  };
  return [read, write];
}

export function setEffect(fn) {
  const execute = () => {
    currentObserver = execute;
    fn();
    currentObserver = null;
  };
  execute();
}

export function setMemo(fn) {
  const [get, set] = setSignal();
  setEffect(() => set(fn()));
  return get;
}

const SVG_NS = "http://www.w3.org/2000/svg";
const isSvg = (tag) =>
  /^(svg|path|circle|rect|line|polygon|polyline|ellipse|g|text|defs|use)$/.test(
    tag
  );

function insertChildren(parent, children) {
  if (!children) return;
  const childArray = Array.isArray(children) ? children.flat() : [children];
  for (const child of childArray) {
    if (child == null || typeof child === "boolean") continue;
    if (typeof child === "function") {
      const marker = document.createComment("");
      let lastNode = null;
      parent.appendChild(marker);
      setEffect(() => {
        const value = child();

        if (lastNode) {
          if (typeof lastNode === "object" && lastNode.nodeType) {
            lastNode.remove();
          } else {

            const next = marker.nextSibling;
            if (next && next.nodeType === 3) next.remove();
          }
        }

        if (value != null) {
          const newNode =
            typeof value === "object" && value.nodeType
              ? value
              : document.createTextNode(String(value));

          if (marker.parentNode) {
            marker.parentNode.insertBefore(newNode, marker.nextSibling);
            lastNode = newNode;
          }
        } else {
          lastNode = null;
        }
      });
    } else {
      parent.appendChild(
        typeof child === "object" && child.nodeType
          ? child
          : document.createTextNode(String(child))
      );
    }
  }
}

export function jsx(type, props = {}) {
  if (type === Fragment) {
    const fragment = document.createDocumentFragment();
    insertChildren(fragment, props.children);
    return fragment;
  }
  if (typeof type === "function") return type(props);
  const el = isSvg(type)
    ? document.createElementNS(SVG_NS, type)
    : document.createElement(type);
  for (const key in props) {
    if (key === "children" || key === "ref") continue;
    if (key.startsWith("on") && typeof props[key] === "function") {
      el.addEventListener(key.slice(2).toLowerCase(), props[key]);
    } else if (key === "style" && typeof props[key] === "object") {
      Object.assign(el.style, props[key]);
    } else if (key === "className" || key === "class") {
      el.setAttribute("class", props[key]);
    } else if (typeof props[key] !== "function") {
      el.setAttribute(key, props[key]);
    }
  }
  if (props.ref && typeof props.ref === "function") {
    props.ref(el);
  }
  insertChildren(el, props.children);
  return el;
}

export function h(type, props, ...children) {
  props = props || {};
  if (children.length)
    props.children = children.length === 1 ? children[0] : children;
  return jsx(type, props);
}

export default { setSignal, setEffect, setMemo, jsx, h, Fragment };
