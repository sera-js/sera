# 🌐 No-Build, No-Dependencies Setup with SeraJS

SeraJS supports direct use in the browser with **no bundlers**, **no build
steps**, and **zero dependencies**. This guide shows you how to use SeraJS in a
raw HTML file using native ES modules.

---

## ✅ What You Get

- 🚫 No need for Webpack, Vite, or Babel
- ✅ Pure native `import` from CDN (e.g. [unpkg.com](https://unpkg.com))
- ⚡ Fast, minimal and reactive UI with signals and effects

---

## 🗂 Example: Basic Counter Component

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Sera js 😎</title>
  </head>
  <body>
    <script type="module">
      import { h, setSignal, setEffect } from "//unpkg.com/serajs";

      function Hello() {
        const [count, setCount] = setSignal(0);

        setEffect(() => {
          console.log(count()); // Runs when count changes
        });

        return h(
          "div",
          null,
          h("h1", null, "Hello World!"),
          h("p", { style: { color: "red" } }, "Do you Like Serajs?"),
          h("h1", null, () => `Count: ${count()}`),
          h(
            "button",
            { onclick: () => setCount(count() + 1) },
            "Increase Count"
          )
        );
      }

      const root = document.body;
      root.appendChild(Hello());
    </script>
  </body>
</html>
```

---

## 🔍 Explanation

### ✅ `import { h, setSignal, setEffect } from "//unpkg.com/serajs";`

- **`h(tag, props, ...children)`**: Creates a virtual DOM node (like React's
  `createElement`).
- **`setSignal(value)`**: Creates a reactive state signal.
  - Returns `[getter, setter]`.
- **`setEffect(callback)`**: Runs a reactive effect whenever any accessed signal
  changes.

---

## 💡 Why This Is Cool

- ⚡ **Instant load** in the browser
- 🧪 **Perfect for experiments, CodePens, or quick demos**
- 🎒 Great for **teaching or learning reactivity** without overhead
- 🚀 **Production-ready** with tiny 1.25kb code size
- 💼 **Practical for real apps** where bundle size matters

---

## 🔗 Tips

- For local dev, use a live server or open in Chrome with the
  `--allow-file-access-from-files` flag (if importing modules from local paths).
- Always use `"type=module"` for script tags when using native ES module
  imports.

---

## 📁 Zero-Setup Folder Structure

```
/your-project
  └── index.html
```

That’s it! No `package.json`, no `node_modules`.

---

## 🧪 Try It Yourself

Paste the above code into an `index.html` file and open it in your browser.

Happy hacking with SeraJS! 💚

---
