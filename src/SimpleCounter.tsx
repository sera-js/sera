import { createElement, signal } from "./sera";

export function SimpleCounter() {
  const count = signal(0);

  return (
    <div style={{ padding: "10px", border: "1px solid #00aa00" }}>
      <h2>Auto-Reactive Counter (No compute() needed!)</h2>
      <p>Count: {count.value}</p>
      <button onClick={() => (count.value = count.value + 1)}>+1</button>
      <p style={{ fontSize: "0.8em", color: "#666" }}>
        This component automatically re-renders when count changes.
      </p>
    </div>
  );
}
