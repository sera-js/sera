# 📦 SeraJS Reusable Components Guide

This guide helps you understand how to create and use reusable components in
**SeraJS**.

---

## 🧩 Component: `Hello`

### ✅ Purpose

A simple component to display a greeting message using a `name` prop.

---

### 🗂 File Structure

```
/project-root
  ├── App.jsx
  └── Hello.jsx
```

---

### 📄 `Hello.jsx`

```jsx
import { h } from "serajs";

//Option A: Destructured props
export default function Hello({ name }) {
  return <h1>Hello {name}</h1>;
}

// Option B: Access via object
export default function Hello(person) {
  return <h1>Hello {person.name}</h1>;
}
```

- `person.name` can be replaced with `name` if you use the destructured props
  version (Option A).
- Both approaches are valid — choose based on your preference or project
  standards.

---

### 📄 `App.jsx`

```jsx
import { h } from "serajs";
import Hello from "./hello";

export default function App() {
  return <Hello name="Sara" />;
}
```

- The `Hello` component is imported and used like a regular JSX component.
- We pass the `name` prop (`"Sara"`), which gets displayed inside the `Hello`
  component.

---

## ♻️ How to Make Components Reusable

1. **Use props**: Pass data into components using props.
2. **Avoid hardcoding**: Keep content dynamic using the props passed.
3. **Export components**: Use `export default` to make components available for
   import.
4. **Import with path**: Import components relative to the file path
   (`./hello`).

---

## 🧪 Example with Multiple Props

```jsx
export default function Welcome({ name, age }) {
  return (
    <p>
      Welcome {name}, Age: {age}
    </p>
  );
}
```

Usage:

```jsx
<Welcome name="Alex" age={25} />
```

---

## ✅ Best Practices

- 🧼 Keep components small and focused.
- 📦 Group related components in folders.
- 🧪 Test components individually before integration.
- 📘 Document props with JSDoc or comments.

---

## 📚 Resources

- [SeraJS GitHub](https://github.com/sera-js/sera)

---
