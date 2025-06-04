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
      let lastNodes = [];
      parent.appendChild(marker);
      setEffect(() => {
        const value = child();

        // Clean up previous nodes
        lastNodes.forEach((node) => {
          if (node && node.remove) node.remove();
        });
        lastNodes = [];

        if (value != null) {
          // Handle arrays of elements (like from map())
          if (Array.isArray(value)) {
            value.forEach((item) => {
              if (item != null) {
                const newNode =
                  typeof item === "object" && item.nodeType
                    ? item
                    : document.createTextNode(String(item));

                if (marker.parentNode) {
                  marker.parentNode.insertBefore(newNode, marker.nextSibling);
                  lastNodes.push(newNode);
                }
              }
            });
          } else {
            // Handle single values
            const newNode =
              typeof value === "object" && value.nodeType
                ? value
                : document.createTextNode(String(value));

            if (marker.parentNode) {
              marker.parentNode.insertBefore(newNode, marker.nextSibling);
              lastNodes.push(newNode);
            }
          }
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

  if (typeof type === "function") {
    const container = document.createDocumentFragment();
    const marker = document.createComment("component");
    container.appendChild(marker);

    setEffect(() => {
      let node = marker.nextSibling;
      while (node) {
        const next = node.nextSibling;
        node.remove();
        node = next;
      }

      const result = type(props);
      if (result != null) {
        const content =
          typeof result === "object" && result.nodeType
            ? result
            : document.createTextNode(String(result));

        if (marker.parentNode) {
          marker.parentNode.insertBefore(content, marker.nextSibling);
        } else {
          container.appendChild(content);
        }
      }
    });

    return container;
  }

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
