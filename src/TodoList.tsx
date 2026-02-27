import { createElement, signal, compute } from "./sera";

interface Todo {
  id: number;
  text: string;
  done: boolean;
}

export function TodoList() {
  const todos = signal<Todo[]>([]);
  const text = signal("");

  function add() {
    if (text.value === "") return;

    todos.value = [
      ...todos.value,
      { id: Date.now(), text: text.value, done: false },
    ];

    text.value = "";
  }

  function toggle(id: number) {
    todos.value = todos.value.map((t) =>
      t.id === id ? { ...t, done: !t.done } : t,
    );
  }

  function remove(id: number) {
    todos.value = todos.value.filter((t) => t.id !== id);
  }

  return (
    <div>
      <h1>Todo List</h1>

      <input value={text} onInput={(e: any) => (text.value = e.target.value)} />

      <button onClick={add}>Add</button>

      <ul>
        {compute(() =>
          todos.value.map((t) => (
            <li key={t.id}>
              <span onClick={() => toggle(t.id)}>
                {t.done ? "✔ " : ""}
                {t.text}
              </span>

              <button onClick={() => remove(t.id)}>X</button>
            </li>
          )),
        )}
      </ul>

      <p>
        {compute(
          () =>
            `${todos.value.filter((t) => t.done).length} / ${todos.value.length}`,
        )}
      </p>
    </div>
  );
}
