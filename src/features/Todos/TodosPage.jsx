import { useState } from "react";
import { useEffect } from "react";
import TodoList from "./Todolist/Todolist.jsx";
import TodoForm from "./TodoForm.jsx";

export default function TodosPage({ token }) {
  const [todoList, setTodoList] = useState([]);
  const [isTodoListLoading, setIsTodoListLoading] = useState("false");
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchTodos() {
      setIsTodoListLoading(true);
      try {
        const response = await fetch("/api/tasks", {
          headers: { "X-CSRF-TOKEN": token },
          credentials: "include",
        });
        const data = await response.json();
        if (response.ok) {
          setTodoList(data.tasks);
        } else if (response.status === 401) {
          throw new Error("unauthorized");
        } else {
          throw new Error("Unable to load tasks");
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setIsTodoListLoading(false);
      }
    }

    fetchTodos();
  }, [token]);

  async function addTodo(todoTitle) {
    const newTodo = {
      id: Date.now(),
      title: todoTitle,
      isCompleted: false,
    };
    setTodoList((previous) => [newTodo, ...previous]);

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": token,
        },
        credentials: "include",
        body: JSON.stringify({
          title: todoTitle,
          isCompleted: false,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setTodoList((previous) =>
          previous.map((todo) => (todo.id === newTodo.id ? data : todo)),
        );
      } else {
        throw new Error("Unable to add task");
      }
    } catch (error) {
      setTodoList((previous) =>
        previous.filter((todo) => todo.id !== newTodo.id),
      );
      setError(error.message);
    }
  }

  function completeTodo(id) {
    const updatedTodoList = todoList.map((todo) => {
      if (todo.id === id) {
        return { ...todo, isCompleted: true };
      }
      return todo;
    });
    setTodoList(updatedTodoList);
  }

  function updateTodo(editedTodo) {
    const updatedTodos = todoList.map((todo) => {
      if (todo.id === editedTodo.id) {
        return { ...editedTodo };
      }

      return todo;
    });

    setTodoList(updatedTodos);
  }

  return (
    <div>
      {error ? (
        <div>
          <p>{error}</p>
          <button type="button" onClick={() => setError("")}>
            Clear error
          </button>
        </div>
      ) : null}

      {isTodoListLoading ? <p>Loading todos...</p> : null}
      <h1>Todos Page</h1>
      <TodoForm onAddTodo={addTodo} />
      <TodoList
        todoList={todoList}
        onCompleteTodo={completeTodo}
        onUpdateTodo={updateTodo}
      />
    </div>
  );
}
