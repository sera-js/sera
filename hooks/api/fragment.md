# 🔹 Fragment in SeraJS JSX

## 📦 What is `<Fragment>`?

In **SeraJS**, `<Fragment>` is used when you want to return **multiple
elements** without wrapping them in an extra DOM node like a `<div>`.

---

## ✅ Example

```js
import { h, Fragment } from "serajs";

export default function App() {
  return (
    <Fragment>
      <h1>Hello</h1>
      <p>Welcome to SeraJS</p>
    </Fragment>
  );
}
```

This returns both the ``<h1>`` and ``<p>`` without adding an extra parent node in the DOM.

⚠️ Note
SeraJS currently does not support the short syntax:


```jsx
<>
  <h1>Hello</h1>
  <p>Welcome</p>
</>
```

⛔ This will throw an error in the current version.

🛠️ Coming Soon
Support for ``<>...</>`` shorthand fragments will be added in the next update of SeraJS. 🎉

Until then, please use:


```jsx 
<Fragment> ... </Fragment>
```

💡 Why use fragments?
To avoid unnecessary wrapper ``<div>`` s

To return multiple sibling nodes from a component

✅ Good

```jsx
<Fragment>
  <div>One</div>
  <div>Two</div>
</Fragment>
```

❌ Not Yet

```jsx
<>
  <div>One</div>
  <div>Two</div>
</>
```

Stay tuned for the next update of SeraJS with JSX shorthand fragments! 🧩

