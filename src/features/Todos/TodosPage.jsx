import { useState } from "react";
import { useEffect } from "react";
import TodoList from "./Todolist/Todolist.jsx";
import TodoForm from "./TodoForm.jsx";

export default function TodosPage({ token }) {
  const [todoList, setTodoList] = useState([]);
  const [isTodoListLoading, setIsTodoListLoading] = useState(false);
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

  async function completeTodo(id) {
    const previousTodo = todoList.find((todo) => todo.id === id);
    const updatedTodoList = todoList.map((todo) => {
      if (todo.id === id) {
        return { ...todo, isCompleted: true };
      }
      return todo;
    });
    setTodoList(updatedTodoList);
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": token,
        },
        credentials: "include",
        body: JSON.stringify({
          isCompleted: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to complete task");
      }
    } catch (error) {
      setTodoList((previous) =>
        previous.map((todo) => (todo.id === id ? previousTodo : todo)),
      );

      setError(error.message);
    }
  }

  async function updateTodo(editedTodo) {
    const previousTodo = todoList.find((todo) => todo.id === editedTodo.id);

    const updatedTodos = todoList.map((todo) => {
      if (todo.id === editedTodo.id) {
        return { ...editedTodo };
      }

      return todo;
    });

    setTodoList(updatedTodos);
    try {
      const response = await fetch(`/api/tasks/${editedTodo.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": token,
        },
        credentials: "include",
        body: JSON.stringify({
          title: editedTodo.title,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to update task");
      }
    } catch (error) {
      setTodoList((previous) =>
        previous.map((todo) =>
          todo.id === editedTodo.id ? previousTodo : todo,
        ),
      );

      setError(error.message);
    }
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
