/**
 * Sera.js - A lightweight reactive JavaScript library
 * v1.2.0
 *
 * Features:
 * - High-performance reactivity system with automatic batching and scheduling
 * - Memory leak prevention through signal cleanup and effect disposal
 * - Automatic DOM cleanup using MutationObserver
 * - Element pooling for improved rendering performance
 * - Efficient batched DOM updates with idle scheduling
 * - Reactive primitives: signals, effects, and memos
 * - Small footprint with no dependencies
 * - JSX-compatible API with fragment support
 */

let currentObserver = null;
let effectStack = [];
let batchedUpdates = [];
let isBatchingUpdates = false;
let pendingEffects = new Set();
let frameId = null;

const scheduler = {
  microtask: (fn) => Promise.resolve().then(fn),
  animationFrame: (fn) => requestAnimationFrame(fn),
  idle: (fn) =>
    requestIdleCallback ? requestIdleCallback(fn) : setTimeout(fn, 0),

  processBatch() {
    if (batchedUpdates.length === 0) return;

    const updates = [...batchedUpdates];
    batchedUpdates = [];

    const seen = new Set();
    for (const callback of updates) {
      if (!seen.has(callback)) {
        seen.add(callback);
        callback();
      }
    }
  },

  flushEffects() {
    if (pendingEffects.size === 0) return;

    const effects = [...pendingEffects];
    pendingEffects.clear();

    for (const effect of effects) {
      effect();
    }
  },

  scheduleRender() {
    if (frameId !== null) return;

    frameId = scheduler.animationFrame(() => {
      frameId = null;
      scheduler.processBatch();
      scheduler.flushEffects();
    });
  },

  autoBatch() {
    isBatchingUpdates = true;
    scheduler.microtask(() => {
      isBatchingUpdates = false;
      scheduler.scheduleRender();
    });
  },
};

const memoCache = new WeakMap();

export function setSignal(initialValue) {
  const subscribers = new Set();
  let currentValue = initialValue;

  const derivedCache = new Map();
  const history = [];
  const maxHistoryLength = 10;

  const read = () => {
    if (currentObserver) subscribers.add(currentObserver);
    return currentValue;
  };

  const write = (newValue) => {
    const nextValue =
      typeof newValue === "function" ? newValue(currentValue) : newValue;

    if (Object.is(nextValue, currentValue)) return;

    if (!isBatchingUpdates) {
      scheduler.autoBatch();
    }

    if (history.length >= maxHistoryLength) {
      history.shift();
    }
    history.push(currentValue);

    currentValue = nextValue;
    derivedCache.clear();

    if (subscribers.size > 0) {
      const subscriberArray = [...subscribers];
      subscriberArray.forEach((fn) => batchedUpdates.push(fn));
    }
  };

  read.derive = (deriveFn) => {
    const key = deriveFn.toString();

    if (!derivedCache.has(key)) {
      derivedCache.set(key, deriveFn(currentValue));
    }

    return derivedCache.get(key);
  };

  read.cleanup = () => {
    subscribers.clear();
    derivedCache.clear();
  };

  read.peek = () => currentValue;

  read.undo = () => {
    if (history.length > 0) {
      const previousValue = history.pop();
      write(previousValue);
      return true;
    }
    return false;
  };

  read.subscribe = (callback) => {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
  };

  read.transform = (transformFn) => {
    const [derivedValue, setDerivedValue] = setSignal(
      transformFn(currentValue)
    );

    read.subscribe(() => {
      setDerivedValue(transformFn(currentValue));
    });

    return derivedValue;
  };

  read.meta = {
    subscribers: () => subscribers.size,
    hasSubscribers: () => subscribers.size > 0,
    historyLength: () => history.length,
  };

  return [read, write];
}

export function setEffect(fn) {
  if (typeof fn !== "function") {
    throw new TypeError("setEffect requires a function as its argument");
  }

  let isRunning = false;

  const execute = () => {
    if (isRunning) return;

    if (execute.cleanup) {
      execute.cleanup();
      execute.cleanup = null;
    }

    currentObserver = execute;
    effectStack.push(execute);

    try {
      isRunning = true;
      const cleanup = fn();
      if (typeof cleanup === "function") {
        execute.cleanup = cleanup;
      }
    } finally {
      isRunning = false;
      effectStack.pop();
      currentObserver =
        effectStack.length > 0 ? effectStack[effectStack.length - 1] : null;
    }
  };

  if (isBatchingUpdates) {
    pendingEffects.add(execute);
  } else {
    execute();
  }

  return () => {
    if (execute.cleanup) {
      execute.cleanup();
      execute.cleanup = null;
    }

    pendingEffects.delete(execute);
  };
}

export function setMemo(fn) {
  if (!memoCache.has(fn)) {
    const [get, set] = setSignal();
    const dispose = setEffect(() => set(fn()));

    get.cleanup = () => {
      dispose();
      get.cleanup = null;
    };

    memoCache.set(fn, get);
  }

  return memoCache.get(fn);
}

const SVG_NS = "http://www.w3.org/2000/svg";
const isSvg = (tag) =>
  /^(svg|path|circle|rect|line|polygon|polyline|ellipse|g|text|defs|use)$/.test(
    tag
  );

const setupAutoCleanup = () => {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "childList") {
        mutation.removedNodes.forEach((node) => {
          if (node._cleanup && typeof node._cleanup === "function") {
            node._cleanup();
            node._cleanup = null;
          }
        });
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    });
  }
};

if (typeof window !== "undefined") {
  setupAutoCleanup();
}

const elementPool = new Map();

function getFromPool(type) {
  if (!elementPool.has(type)) {
    elementPool.set(type, []);
  }
  const pool = elementPool.get(type);
  return pool.pop() || null;
}

function releaseToPool(element) {
  if (!element.tagName) return;

  const type = element.tagName.toLowerCase();
  if (!elementPool.has(type)) {
    elementPool.set(type, []);
  }

  element.textContent = "";
  while (element.attributes.length > 0) {
    element.removeAttribute(element.attributes[0].name);
  }

  const pool = elementPool.get(type);
  if (pool.length < 100) {
    pool.push(element);
  }
}

export function Fragment(props) {
  const fragment = document.createDocumentFragment();
  insertChildren(fragment, props.children);
  return fragment;
}

function insertChildren(parent, children) {
  if (!children) return;

  const childArray = Array.isArray(children) ? children.flat() : [children];

  const batchSize = 10;
  const childCount = childArray.length;

  processBatch(0, Math.min(batchSize, childCount));

  if (childCount > batchSize) {
    let currentIndex = batchSize;

    const processNextBatch = () => {
      const endIndex = Math.min(currentIndex + batchSize, childCount);
      processBatch(currentIndex, endIndex);
      currentIndex = endIndex;

      if (currentIndex < childCount) {
        scheduler.idle(processNextBatch);
      }
    };

    scheduler.idle(processNextBatch);
  }

  function processBatch(start, end) {
    for (let i = start; i < end; i++) {
      const child = childArray[i];

      if (child == null || typeof child === "boolean") continue;

      if (typeof child === "function") {
        const marker = document.createComment("");
        let lastValue = null;
        parent.appendChild(marker);

        setEffect(() => {
          const value = child();
          if (Object.is(value, lastValue)) return;
          lastValue = value;

          let node;
          while ((node = marker.nextSibling) && node.nodeType !== 8) {
            if (node._cleanup && typeof node._cleanup === "function") {
              node._cleanup();
              node._cleanup = null;
            }
            releaseToPool(node);
            node.remove();
          }

          if (value == null) return;

          if (typeof value === "object" && value.nodeType) {
            parent.insertBefore(value, marker.nextSibling);
          } else if (typeof value !== "object") {
            parent.insertBefore(
              document.createTextNode(String(value)),
              marker.nextSibling
            );
          }
        });
      } else if (typeof child === "object" && child.nodeType) {
        parent.appendChild(child);
      } else {
        parent.appendChild(document.createTextNode(String(child)));
      }
    }
  }
}

export function createElement(type, props = {}) {
  if (typeof type === "function") return type(props);
  if (type === Fragment) return Fragment(props);

  const el = isSvg(type)
    ? document.createElementNS(SVG_NS, type)
    : getFromPool(type) || document.createElement(type);

  const cleanups = new Set();

  for (const key in props) {
    if (key === "children" || key === "ref") continue;

    if (key.startsWith("on") && typeof props[key] === "function") {
      const eventName = key.slice(2).toLowerCase();
      const handler = props[key];
      el.addEventListener(eventName, handler);
      cleanups.add(() => el.removeEventListener(eventName, handler));
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

  if (!isBatchingUpdates) {
    scheduler.autoBatch();
  }

  insertChildren(el, props.children);

  el._cleanup = () => {
    cleanups.forEach((cleanup) => cleanup());
    cleanups.clear();

    Array.from(el.childNodes).forEach((child) => {
      if (child._cleanup && typeof child._cleanup === "function") {
        child._cleanup();
        child._cleanup = null;
      }
    });

    releaseToPool(el);
  };

  return el;
}

export function h(type, props, ...children) {
  props = props || {};
  if (children.length)
    props.children = children.length === 1 ? children[0] : children;
  return createElement(type, props);
}

export default {
  setSignal,
  setEffect,
  setMemo,
  createElement,
  h,
  Fragment,
};
