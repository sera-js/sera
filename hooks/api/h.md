# ⚡ `h` Function in SeraJS

The `h` function is a lightweight helper used to create DOM elements or
component trees in plain JavaScript. It allows you to build UIs without using
JSX syntax.

---

## 🧠 What It Does

The `h` function:

- Creates HTML/SVG elements or calls functional components.
- Accepts children as **variadic arguments**.
- Normalizes props and appends children properly.
- Supports full integration with SeraJS reactivity (signals, effects, memos).

---

## 📥 Function Signature

```js
h(type, props?, ...children)
```

## Parameter	Description

type	A string like ``"div"``, ``"svg"``, or a component function.
props	An optional object with attributes, styles, events, etc.
children	Zero or more child elements, strings, functions, or nodes.


## 🔧 How It Works
> 1. Props Handling
If props is null or undefined, it defaults to {}.
If children are passed:
A single child is assigned ``directly: props.children = child``
Multiple children are grouped in an ``array: props.children = [child1, child2, ...]``

> 2. Component or Element Creation
If type is a function, it’s treated as a component and invoked with props.
If type is a string, a DOM element is created and:
props are applied ``(class, style, events, etc.)``
Children are inserted and made reactive if functions.


✅ Example
```js
const element = h("div", { className: "box" },
  "Hello ",
  h("span", null, "World")
);
```

Output:
```html
<div class="box">Hello <span>World</span></div>
```
🧪 Reactive Example
```js
import { setSignal, h } from "serajs";

const [getCount, setCount] = setSignal(0);

const App = () =>
  h("div", { className: "app" },
    h("h1", null, "Count: ", () => getCount()),
    h("button", { onClick: () => setCount(c => c + 1) }, "Increment")
  );

document.body.appendChild(App());
```

Output:
Live-updating count that reacts to button clicks.
## 🧵 Summary

| Feature | Description |
| ------- | ----------- |
| DOM creation | Works with HTML & SVG |
| Component rendering | Accepts functional components |
| Props & Events | Supports className, style, event handlers |
| Variadic children | Automatically handled |
| Reactive support | Integrates with signals, memos, effects |