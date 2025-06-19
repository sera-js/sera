# Sera.js Test Suite Summary

This document summarizes and documents the automated tests for the core Sera.js API, including `setSignal`, `setEffect`, `setMemo`, `jsx`, `h`, and `Fragment`.

## setSignal
- **Basic getter/setter:** Ensures the getter returns the initial value and the setter updates it.
- **Updater function:** Setter can accept a function to update the value based on the previous value.
- **Effect notification:** Subscribers (effects) are notified when the value changes.
- **No notification on same value:** (Current implementation always notifies, even if the value is unchanged.)
- **Complex values:**
  - Works with objects, arrays, and nested structures.
  - Supports updating deeply nested data.
- **Component integration:** Can be passed as a prop to components and used reactively.

## setEffect
- **Immediate execution:** Runs the effect function immediately.
- **Reactivity:** Re-runs the effect when any of its dependencies (signals) change.
- **Dynamic dependencies:** Tracks dependencies dynamically, updating which signals are tracked as dependencies change.
- **Multiple effects:** Multiple effects can run independently and respond to the same or different signals.

## setMemo
- **Memoization:** Returns a getter for a computed value that updates when dependencies change.
- **Recompute on dependency change:** Only recomputes when dependencies change.
- **Multiple dependencies:** Supports computations based on multiple signals.

## Fragment
- **DocumentFragment creation:** Renders children into a `DocumentFragment`.
- **Children handling:** Supports arrays, nested fragments, and ignores null/undefined/boolean children.

## jsx
- **Element creation:** Creates DOM elements for string types.
- **Props and events:** Sets properties, styles, event listeners, and refs.
- **Fragment support:** Handles `Fragment` for grouping children.
- **Function components:** Supports function components and their props/children.
- **Reactivity:** Supports reactive children via signals.
- **Nested elements:** Handles deeply nested structures.

## h
- **Hyperscript API:** Same as `jsx`, but with variadic children arguments.
- **All jsx features:** Fully tested for DOM creation, props, events, fragments, function components, and reactivity.

---

All tests are automated using Vitest and cover both simple and complex usage scenarios, ensuring Sera.js is robust for real-world applications.
