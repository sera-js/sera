# 🧠 `setSignal`

This guide walks you through how to use `setSignal` in SeraJS to create reactive
state in your UI components.

---

## ✨ What is `setSignal`?

`setSignal` is a function provided by SeraJS that allows you to create reactive
state. It returns a getter and a setter — when the value changes, the UI updates
automatically.

```jsx
const [value, setValue] = setSignal(initialValue);
```

``value()`` — a function that returns the current value.


``setValue(newValue)`` — updates the value and re-renders any part of the UI that depends on it.


🚀 Example App Here's a basic counter example using setSignal.

```jsx
import { h, setSignal, Fragment } from "serajs";

export default function App() {
  const [count, setCount] = setSignal(0);

  return (
    <Fragment>
      <h1>{() => count()}</h1>
      <button onClick={() => setCount(count() + 1)}>Increment Count</button>
      <button onClick={() => setCount(count() - 1)}>Decrement Count</button>
      <button onClick={() => setCount(0)}>Reset Count</button>
    </Fragment>
  );
}
```

🔍 Explanation ``setSignal(0)`` creates a reactive signal with an initial value
of 0.


``count()`` returns the current count.

``setCount(newValue)`` updates the value.

The `<h1>` element automatically re-renders when count() changes.


## 🧪 Why use setSignal? 

✅ Reactive and declarative

✅ Minimal and fast

✅ Easy to use in JSX

🛠 Tips Always use ``()`` when accessing the signal value: ``count()``

You can use signals inside any reactive expressions in your JSX.
