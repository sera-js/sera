// sera.ts

const SIGNAL_BRAND = Symbol("signal");

let currentEffect: EffectFn | null = null;
const effectStack: EffectFn[] = [];

// ─── Hook System ───

let currentHooks: any[] | null = null;
let currentHookIndex = 0;

function getHook<T>(creator: () => T): T {
  if (!currentHooks) return creator();
  
  const idx = currentHookIndex++;
  if (idx < currentHooks.length) {
    return currentHooks[idx];
  }
  
  const hook = creator();
  currentHooks.push(hook);
  return hook;
}

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

function createSignal<T>(initialValue: T): Signal<T> {
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
      if (Object.is(value, newValue)) return;
      value = newValue;
      [...subs].forEach((fn) => {
        if (fn._active) schedule(fn);
      });
    },
  };
}

export function signal<T>(initialValue: T): Signal<T> {
  return getHook(() => createSignal(initialValue));
}

// Cleanup helper: remove effect from all its signal subscriptions
function cleanup(eff: EffectFn) {
  eff._deps.forEach((subSet) => subSet.delete(eff));
  eff._deps.clear();
}

export function effect(fn: () => void): () => void {
  const execute: EffectFn = (() => {
    if (!execute._active) return;

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

  execute();

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

// ─── Context System ───

const contextMap = new WeakMap<Node, Map<string | symbol, any>>();

let currentComponentNode: Node | null = null;
const componentNodeStack: Node[] = [];

function pushComponentScope(node: Node) {
  if (currentComponentNode) {
    componentNodeStack.push(currentComponentNode);
  }
  currentComponentNode = node;
}

function popComponentScope() {
  currentComponentNode = componentNodeStack.pop() || null;
}

export function setContext<T>(key: string | symbol, value: T): void {
  if (!currentComponentNode) {
    throw new Error(
      "setContext() must be called during component initialization",
    );
  }

  let map = contextMap.get(currentComponentNode);
  if (!map) {
    map = new Map();
    contextMap.set(currentComponentNode, map);
  }
  map.set(key, value);
}

export function getContext<T>(key: string | symbol): T {
  if (!currentComponentNode) {
    throw new Error(
      "getContext() must be called during component initialization",
    );
  }

  // Walk up from current node through DOM ancestors
  let node: Node | null = currentComponentNode;
  while (node) {
    const map = contextMap.get(node);
    if (map && map.has(key)) {
      return map.get(key) as T;
    }
    node = node.parentNode;
  }

  // Check the component stack (for nodes not yet in the DOM)
  for (let i = componentNodeStack.length - 1; i >= 0; i--) {
    const stackNode = componentNodeStack[i];
    const map = contextMap.get(stackNode);
    if (map && map.has(key)) {
      return map.get(key) as T;
    }
  }

  throw new Error(
    `Context "${String(key)}" not found. Did a parent call setContext()?`,
  );
}

export function hasContext(key: string | symbol): boolean {
  if (!currentComponentNode) return false;

  let node: Node | null = currentComponentNode;
  while (node) {
    const map = contextMap.get(node);
    if (map && map.has(key)) return true;
    node = node.parentNode;
  }

  for (let i = componentNodeStack.length - 1; i >= 0; i--) {
    const map = contextMap.get(componentNodeStack[i]);
    if (map && map.has(key)) return true;
  }

  return false;
}

// ─── DOM Helpers ───

const nodeDisposers = new WeakMap<Node, (() => void)[]>();

function trackDisposer(node: Node, dispose: () => void) {
  let list = nodeDisposers.get(node);
  if (!list) {
    list = [];
    nodeDisposers.set(node, list);
  }
  list.push(dispose);
}

function disposeTree(node: Node) {
  // Handle component markers
  if (node.nodeType === Node.COMMENT_NODE) {
    const componentData = componentMarkers.get(node);
    if (componentData) {
      componentData.dispose();
      componentMarkers.delete(node);
    }
  }

  const disposers = nodeDisposers.get(node);
  if (disposers) {
    disposers.forEach((d) => d());
    nodeDisposers.delete(node);
  }
  node.childNodes.forEach(disposeTree);
}

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

// ─── Component Rendering ───

const componentMarkers = new WeakMap<Node, { dispose: () => void; lastNodes: Node[] }>();

function renderComponentReactive(
  componentFn: Function,
  props: Record<string, any> | null,
  children: any[]
): HTMLElement | DocumentFragment {
  const marker = document.createComment("component");
  let lastNodes: Node[] = [];
  let isFirstRun = true;
  
  // Persistent hooks for this component instance
  const hooks: any[] = [];

  const dispose = effect(() => {
    const scope = document.createDocumentFragment();
    pushComponentScope(scope);

    // Setup hook context
    const prevHooks = currentHooks;
    const prevIndex = currentHookIndex;
    currentHooks = hooks;
    currentHookIndex = 0;

    let result: Node;
    try {
      result = componentFn({ ...props, children });
    } finally {
      // Restore hook context
      currentHooks = prevHooks;
      currentHookIndex = prevIndex;
      popComponentScope();
    }

    // Collect all nodes from result
    const newNodes: Node[] = [];
    if (result instanceof DocumentFragment) {
      newNodes.push(...Array.from(result.childNodes));
    } else {
      newNodes.push(result);
    }

    // First run: just store the nodes, they'll be added to wrapper
    if (isFirstRun) {
      lastNodes = newNodes;
      isFirstRun = false;
      return;
    }

    // Subsequent runs: replace nodes in-place (marker must be in DOM)
    if (marker.parentNode && lastNodes.length > 0) {
      const parent = lastNodes[0].parentNode;
      if (!parent) return;

      // Get position to insert new nodes (before marker's next sibling)
      const insertBefore = lastNodes[lastNodes.length - 1].nextSibling;

      // Remove old nodes
      lastNodes.forEach((node) => {
        disposeTree(node);
        removeListeners(node);
        if (node.parentNode) node.parentNode.removeChild(node);
      });

      // Insert new nodes at the same position
      newNodes.forEach((node) => {
        if (insertBefore) {
          parent.insertBefore(node, insertBefore);
        } else {
          parent.appendChild(node);
        }
      });

      lastNodes = newNodes;
    }
  });

  componentMarkers.set(marker, { dispose, lastNodes });

  // Create wrapper with marker + initial nodes
  const wrapper = document.createDocumentFragment();
  wrapper.appendChild(marker);
  lastNodes.forEach((node) => wrapper.appendChild(node));

  return wrapper;
}

// ─── createElement ───

export function createElement(
  tag: string | Function,
  props: Record<string, any> | null,
  ...children: any[]
): HTMLElement | DocumentFragment {
  // Component function — now with automatic dependency tracking
  if (typeof tag === "function") {
    return renderComponentReactive(tag, props, children);
  }

  const el = document.createElement(tag);

  if (props) {
    for (const [key, val] of Object.entries(props)) {
      if (key === "ref") {
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
      const val = child.value;
      
      if (Array.isArray(val)) {
        const container = document.createDocumentFragment();
        const dispose = effect(() => {
          while (container.firstChild) {
            container.removeChild(container.firstChild);
          }
          child.value.forEach((item: any) => {
            if (item instanceof Node) {
              container.appendChild(item);
            }
          });
          parent.replaceChildren(...Array.from(container.childNodes));
        });
        trackDisposer(parent, dispose);
        child.value.forEach((item: any) => {
          if (item instanceof Node) {
            container.appendChild(item);
          }
        });
        parent.replaceChildren(...Array.from(container.childNodes));
        return;
      }

      if (val instanceof Node) {
        const dispose = effect(() => {
          parent.replaceChildren(child.value);
        });
        trackDisposer(parent, dispose);
        parent.appendChild(val);
        return;
      }

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
  disposeTree(container);
  removeListeners(container);
  container.innerHTML = "";

  const result = component();
  container.appendChild(result);

  return () => {
    disposeTree(container);
    removeListeners(container);
    container.innerHTML = "";
  };
}

// ─── JSX Namespace ───

export namespace JSX {
  export type Element = HTMLElement;
  export interface IntrinsicElements {
    [elemName: string]: any;
  }
}

export const h = createElement;
