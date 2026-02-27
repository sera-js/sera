// sera.ts

const SIGNAL_BRAND = Symbol("signal");

let currentEffect: EffectFn | null = null;
const effectStack: EffectFn[] = [];

// Batching system
let pending = false;
const queue = new Set<EffectFn>();

function flush() {
  const fns = [...queue];
  queue.clear();
  pending = false;
  fns.forEach((fn) => fn());
}

function schedule(fn: EffectFn) {
  queue.add(fn);
  if (!pending) {
    pending = true;
    queueMicrotask(flush);
  }
}

// Effect function type with dependency tracking
interface EffectFn {
  (): void;
  _deps: Set<Set<EffectFn>>;
  _active: boolean;
}

// Signal type
export interface Signal<T> {
  readonly [SIGNAL_BRAND]: true;
  value: T;
}

export interface ReadonlySignal<T> {
  readonly [SIGNAL_BRAND]: true;
  readonly value: T;
}

export function signal<T>(initialValue: T): Signal<T> {
  let value = initialValue;
  const subs = new Set<EffectFn>();

  return {
    [SIGNAL_BRAND]: true as const,
    get value(): T {
      if (currentEffect) {
        subs.add(currentEffect);
        currentEffect._deps.add(subs);
      }
      return value;
    },
    set value(newValue: T) {
      if (Object.is(value, newValue)) return; // skip if same value
      value = newValue;
      // schedule all subscribers for batched execution
      [...subs].forEach((fn) => {
        if (fn._active) schedule(fn);
      });
    },
  };
}

// Cleanup helper: remove effect from all its signal subscriptions
function cleanup(eff: EffectFn) {
  eff._deps.forEach((subSet) => subSet.delete(eff));
  eff._deps.clear();
}

export function effect(fn: () => void): () => void {
  const execute: EffectFn = (() => {
    if (!execute._active) return;

    // Remove from all previous subscriptions before re-running
    cleanup(execute);

    effectStack.push(execute);
    currentEffect = execute;
    try {
      fn();
    } finally {
      effectStack.pop();
      currentEffect = effectStack[effectStack.length - 1] || null;
    }
  }) as EffectFn;

  execute._deps = new Set();
  execute._active = true;

  // Run synchronously the first time to collect initial dependencies
  execute();

  // Return dispose function
  return () => {
    execute._active = false;
    cleanup(execute);
  };
}

export function compute<T>(fn: () => T): ReadonlySignal<T> {
  let value: T = undefined as T;
  const subs = new Set<EffectFn>();

  const dispose = effect(() => {
    value = fn();
    // notify downstream subscribers (batched)
    [...subs].forEach((sub) => {
      if (sub._active) schedule(sub);
    });
  });

  return {
    [SIGNAL_BRAND]: true as const,
    get value(): T {
      if (currentEffect) {
        subs.add(currentEffect);
        currentEffect._deps.add(subs);
      }
      return value;
    },
  };
}

export function isSignal(child: any): child is Signal<any> {
  return child?.[SIGNAL_BRAND] === true;
}

// Track disposers for cleanup during unmount/re-render
const nodeDisposers = new WeakMap<Node, (() => void)[]>();

function trackDisposer(node: Node, dispose: () => void) {
  let list = nodeDisposers.get(node);
  if (!list) {
    list = [];
    nodeDisposers.set(node, list);
  }
  list.push(dispose);
}

// Recursively dispose all effects tied to a DOM subtree
function disposeTree(node: Node) {
  const disposers = nodeDisposers.get(node);
  if (disposers) {
    disposers.forEach((d) => d());
    nodeDisposers.delete(node);
  }
  node.childNodes.forEach(disposeTree);
}

// Store event listeners for cleanup
const nodeListeners = new WeakMap<
  Node,
  { event: string; handler: EventListener }[]
>();

function trackListener(node: Node, event: string, handler: EventListener) {
  let list = nodeListeners.get(node);
  if (!list) {
    list = [];
    nodeListeners.set(node, list);
  }
  list.push({ event, handler });
}

function removeListeners(node: Node) {
  const listeners = nodeListeners.get(node);
  if (listeners) {
    listeners.forEach(({ event, handler }) => {
      node.removeEventListener(event, handler);
    });
    nodeListeners.delete(node);
  }
  node.childNodes.forEach(removeListeners);
}

function setBooleanOrAttribute(el: HTMLElement, key: string, val: any) {
  if (typeof val === "boolean") {
    if (val) {
      el.setAttribute(key, "");
    } else {
      el.removeAttribute(key);
    }
  } else if (val == null) {
    el.removeAttribute(key);
  } else {
    el.setAttribute(key, String(val));
  }
}

export function createElement(
  tag: string | Function,
  props: Record<string, any> | null,
  ...children: any[]
): HTMLElement | DocumentFragment {
  // Component function
  if (typeof tag === "function") {
    return tag({ ...props, children });
  }

  const el = document.createElement(tag);

  if (props) {
    for (const [key, val] of Object.entries(props)) {
      if (key === "ref") {
        // ref support
        if (typeof val === "function") {
          val(el);
        } else if (isSignal(val)) {
          (val as Signal<HTMLElement | null>).value = el;
        }
      } else if (key.startsWith("on")) {
        const event = key.slice(2).toLowerCase();
        el.addEventListener(event, val);
        trackListener(el, event, val);
      } else if (key === "className") {
        // className can be a signal
        if (isSignal(val)) {
          const dispose = effect(() => {
            el.setAttribute("class", String(val.value));
          });
          trackDisposer(el, dispose);
        } else {
          el.setAttribute("class", val);
        }
      } else if (key === "style" && typeof val === "object" && !isSignal(val)) {
        Object.assign(el.style, val);
      } else if (isSignal(val)) {
        // Reactive attribute
        const dispose = effect(() => {
          setBooleanOrAttribute(el, key, val.value);
        });
        trackDisposer(el, dispose);
      } else {
        setBooleanOrAttribute(el, key, val);
      }
    }
  }

  const append = (parent: HTMLElement, child: any) => {
    if (child == null || child === false || child === true) return;

    if (Array.isArray(child)) {
      child.forEach((c) => append(parent, c));
      return;
    }

    if (isSignal(child)) {
      const text = document.createTextNode(String(child.value));
      const dispose = effect(() => {
        text.textContent = String(child.value);
      });
      trackDisposer(parent, dispose);
      parent.appendChild(text);
      return;
    }

    if (child instanceof Node) {
      parent.appendChild(child);
      return;
    }

    parent.appendChild(document.createTextNode(String(child)));
  };

  children.forEach((child) => append(el, child));
  return el;
}

export function render(
  component: () => HTMLElement | DocumentFragment,
  container: HTMLElement,
): () => void {
  // Cleanup old tree
  disposeTree(container);
  removeListeners(container);
  container.innerHTML = "";

  const result = component();
  container.appendChild(result);

  // Return a cleanup/unmount function
  return () => {
    disposeTree(container);
    removeListeners(container);
    container.innerHTML = "";
  };
}

// JSX namespace
export namespace JSX {
  export type Element = HTMLElement;
  export interface IntrinsicElements {
    [elemName: string]: any;
  }
}

// Convenience: h alias
export const h = createElement;
