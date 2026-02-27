import { createElement, signal, effect, compute } from "./sera";
import Hello from "./hello";
import { Counter } from "./Counter";
import { TodoList } from "./TodoList";
import { SimpleCounter } from "./SimpleCounter";

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
      <h1>Sera - Reactive UI Framework</h1>
      <hr />
      <h2>Examples:</h2>
      
      <SimpleCounter />
      <hr />
      
      <h2>Manual Example with compute():</h2>
      <div style={{ padding: "10px", border: "1px solid #0000aa" }}>
        <h3>Count: {count}</h3>
        <h3>Doubled: {doubled}</h3>
        <button onClick={HandleClick}>Increment</button>
      </div>
      <hr />
      
      <Hello name="Nazmul">Welcome back 🚀</Hello>
      <hr />
      <Counter />
      <hr />
      <TodoList />
    </div>
  );
}
