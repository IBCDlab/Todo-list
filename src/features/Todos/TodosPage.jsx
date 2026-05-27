import { useState } from "react";
import { useEffect } from "react";
import { useCallback } from "react";
import TodoList from "./TodoList/TodoList.jsx";
import TodoForm from "./TodoForm.jsx";
import SortBy from "../../shared/SortBy.jsx";
import FilterInput from "../../shared/FilterInput.jsx";
import useDebounce from "../../utils/useDebounce.js";

export default function TodosPage({ token }) {
  const [todoList, setTodoList] = useState([]);
  const [isTodoListLoading, setIsTodoListLoading] = useState(false);
  const [error, setError] = useState("");
  const [filterError, setFilterError] = useState("");
  const [sortBy, setSortBy] = useState("creationDate");
  const [sortDirection, setSortDirection] = useState("desc");
  const [filterTerm, setFilterTerm] = useState("");
  const debouncedFilterTerm = useDebounce(filterTerm, 300);
  const handleFilterChange = (newTerm) => {
    setFilterTerm(newTerm);
  };
  const [dataVersion, setDataVersion] = useState(0);

  const invalidateCache = useCallback(() => {
    console.log(
    "Invalidating memo cache after todo mutation"
  );
    setDataVersion((prev) => prev + 1);
  }, []);

  useEffect(() => {
    async function fetchTodos() {
      setIsTodoListLoading(true);
      try {
        const paramsObject = {
          sortBy,
          sortDirection,
        };
        if (debouncedFilterTerm) {
          paramsObject.find = debouncedFilterTerm;
        }
        const params = new URLSearchParams(paramsObject);
        const response = await fetch(`/api/tasks?${params}`, {
          headers: { "X-CSRF-TOKEN": token },
          credentials: "include",
        });
        const data = await response.json();
        if (response.ok) {
          setTodoList(data.tasks);
          setFilterError("");
        } else if (response.status === 401) {
          throw new Error("unauthorized");
        } else {
          throw new Error("Unable to load tasks");
        }
      } catch (error) {
        if (
          debouncedFilterTerm ||
          sortBy !== "creationDate" ||
          sortDirection !== "desc"
        ) {
          setFilterError(`Error filtering/sorting todos: ${error.message}`);
        } else {
          setError(`Error fetching todos: ${error.message}`);
        }
      } finally {
        setIsTodoListLoading(false);
      }
    }
    fetchTodos();
  }, [token, sortBy, sortDirection, debouncedFilterTerm]);

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
        invalidateCache();
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
    const originTodo = todoList.find((todo) => todo.id === id);
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
          creationDate: originTodo.creationDate,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to complete task");
      }
      invalidateCache();
    } catch (error) {
      setTodoList((previous) =>
        previous.map((todo) => (todo.id === id ? originTodo : todo)),
      );

      setError(error.message);
    }
  }

  async function updateTodo(editedTodo) {
    const originTodo = todoList.find((todo) => todo.id === editedTodo.id);

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
          isCompleted: editedTodo.isCompleted,
          creationDate: originTodo.creationDate,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to update task");
      }
      invalidateCache();
    } catch (error) {
      setTodoList((previous) =>
        previous.map((todo) => (todo.id === editedTodo.id ? originTodo : todo)),
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

      {filterError ? (
        <div>
          <p>{filterError}</p>
          
          <button type="button" 
          onClick={() => setFilterError("")}>
            Clear filter error
          </button>
        
          <button
            type="button"
            onClick={() => {
              setFilterTerm("");
              setSortBy("creationDate");
              setSortDirection("desc");
              setFilterError("");
            }}
          >
            Reset filters
          </button>
        </div>
      ) : null}

      {isTodoListLoading ? <p>Loading todos...</p> : null}
      <h1>Todos Page</h1>
      <SortBy
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSortByChange={setSortBy}
        onSortDirectionChange={setSortDirection}
      />
      <FilterInput
        filterTerm={filterTerm}
        onFilterChange={handleFilterChange}
      />
      <TodoForm onAddTodo={addTodo} />
      <TodoList
        todoList={todoList}
        onCompleteTodo={completeTodo}
        onUpdateTodo={updateTodo}
        dataVersion={dataVersion}
      />
    </div>
  );
}
