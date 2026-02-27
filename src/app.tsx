import { createElement, signal, effect, compute } from "./sera";
import Hello from "./hello";

export default function App() {
  const count = signal(0);
  const doubled = compute(() => count.value * 2);

  function HandleClick() {
    count.value = count.value + 1;
  }

  effect(() => {
    console.log("Count changed:", count.value);
  });

  return (
    <div>
      <h1>Count: {count}</h1>
      <h2>Doubled: {doubled}</h2>
      <button onClick={HandleClick}>Increment</button>
      <Hello name="Nazmul">Welcome back 🚀</Hello>
    </div>
  );
}
