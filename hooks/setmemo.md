# 🧠 `setMemo` Tutorial in SeraJS

This guide explains how to use `setMemo` in SeraJS to create derived, memoized reactive values based on other signals.

---

## 💡 What is `setMemo`?

`setMemo` allows you to compute **derived values** from one or more signals. It automatically tracks signal dependencies and only recomputes the result when needed.

```js
const result = setMemo(() => someSignal() + 1);
```

Returns a reactive getter function, similar to setSignal.

You can use the returned memo directly in JSX.

🚀 Example App
```jsx
import { h, setSignal, Fragment, setMemo } from "serajs";

export default function App() {
  const [count, setCount] = setSignal(0);
  
  const Dabble = setMemo(() => count() * 2); // Doubles the count

  return (
    <Fragment>
      <h1>{() => count()}</h1>
      <button onClick={() => setCount(count() + 1)}>Increment Count</button>
      <button onClick={() => setCount(count() - 1)}>Decrement Count</button>
      <button onClick={() => setCount(0)}>Reset Count</button>
      <div>
        <h1>Dabble Count: {Dabble}</h1>
        {/* OR */}
        {/* <h1>Dabble Count: {() => Dabble()}</h1> */}
      </div>
    </Fragment>
  );
}
```

✅ How to Use in JSX
You can use a memoized value in JSX in two valid ways:

```jsx
<h1>{() => Dabble()}</h1> // ✅ Valid - function form
<h1>{Dabble}</h1>         // ✅ Also valid - auto-evaluated
```

Both are fully reactive and update when their dependencies (like count) change.

🧠 Why use setMemo?
🚀 Efficient: It avoids unnecessary re-renders by caching results.

🧼 Clean: Separates derived logic from your main UI logic.

🔁 Reactive: Tracks and updates automatically when dependencies change.

⚠️ When to use setMemo
Use it when:

You need to compute a value based on other signals.

The derived value is used in multiple places.

You want to optimize performance.

🧪 Example Output

Count	Dabble
```jsx
0	0
1	2
2	4
3	6
```
🔄 Comparison

Concept	Description
setSignal	Basic reactive value
setMemo	Derived reactive value
setEffect	Side-effect that runs on change

🎉 Summary

``setMemo(() => derivedValue)`` gives you a cached, reactive function.

You can use it directly in JSX as ``{Dabble}`` or ``{() => Dabble()}``.

Great for computed values that depend on signals.

