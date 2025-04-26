# 🔄 What is `setEffect`?

`setEffect` is a reactive side-effect hook in SeraJS.

It automatically runs the provided function **whenever any signal used inside it changes** — no need to specify dependencies manually!

```js
setEffect(() => {
  // reactive logic
});
```

🚀 Example App
Here's a practical counter example that logs the value of count every time it changes:

```js
import { h, setSignal, Fragment, setEffect } from "serajs";

export default function App() {
  const [count, setCount] = setSignal(0);

  setEffect(() => {
    console.log(count()); // Automatically runs when count changes
  });

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

🧠 How it works
setEffect tracks any signal ``(count() in this case)`` that is accessed inside its function.

When ``setCount()`` updates the signal, the effect runs again automatically.

No need to manage dependency arrays like in React.

🛠 Best Practices
Use setEffect for logging, fetching data, syncing localStorage, or any side-effect logic.

Avoid placing setEffect inside your JSX. Keep it at the top level of your component.

🧪 Output Example
Every time you click a button:

```bash
0
1
2
1
0
```

✅ Summary

Feature	Behavior
Auto-runs	When used signals change
No deps	No need for a dependency array
Simplicity	Clean, readable, and reactive
