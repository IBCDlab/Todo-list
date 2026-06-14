import { useEffect } from "react";
import { useCallback } from "react";
import { useReducer } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useSearchParams } from "react-router";

import {
  todoReducer,
  initialTodoState,
  TODO_ACTIONS,
} from "../reducers/todoReducer";

import TodoList from "../features/Todos/TodoList/TodoList.jsx";
import TodoForm from "../features/Todos/TodoForm.jsx";
import SortBy from "../shared/SortBy.jsx";
import FilterInput from "../shared/FilterInput.jsx";
import StatusFilter from "../shared/StatusFilter";

import useDebounce from "../utils/useDebounce.js";

export default function TodosPage() {
  const { token } = useAuth();
  const [searchParams] = useSearchParams();
  const [state, dispatch] = useReducer(todoReducer, initialTodoState);

  const statusFilter = searchParams.get("status") || "all";

  const {
    todoList,
    error,
    filterError,
    isTodoListLoading,
    sortBy,
    sortDirection,
    filterTerm,
    dataVersion,
  } = state;

  const debouncedFilterTerm = useDebounce(filterTerm, 300);

  const handleFilterChange = (newTerm) => {
    dispatch({
      type: TODO_ACTIONS.SET_FILTER,
      payload: {
        filterTerm: newTerm,
      },
    });
  };

  const invalidateCache = useCallback(() => {
    dispatch({
      type: TODO_ACTIONS.FETCH_START,
    });
  }, []);

  useEffect(() => {
    async function fetchTodos() {
      dispatch({
        type: TODO_ACTIONS.FETCH_START,
      });
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
          dispatch({
            type: TODO_ACTIONS.FETCH_SUCCESS,
            payload: {
              tasks: data.tasks,
            },
          });
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
          dispatch({
            type: TODO_ACTIONS.FETCH_ERROR,
            payload: {
              message: `Error filtering/sorting todos: ${error.message}`,
              isFilterError: true,
            },
          });
        } else {
          dispatch({
            type: TODO_ACTIONS.FETCH_ERROR,
            payload: {
              message: `Error fetching todos: ${error.message}`,
              isFilterError: false,
            },
          });
        }
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
    dispatch({
      type: TODO_ACTIONS.ADD_TODO_START,
      payload: {
        newTodo,
      },
    });

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
        dispatch({
          type: TODO_ACTIONS.ADD_TODO_SUCCESS,
          payload: {
            tempId: newTodo.id,
            savedTodo: data,
          },
        });
        invalidateCache();
      } else {
        throw new Error("Unable to add task");
      }
    } catch (error) {
      dispatch({
        type: TODO_ACTIONS.ADD_TODO_ERROR,
        payload: {
          tempId: newTodo.id,
          message: error.message,
        },
      });
    }
  }

  async function completeTodo(id) {
    const originTodo = todoList.find((todo) => todo.id === id);

    dispatch({
      type: TODO_ACTIONS.COMPLETE_TODO_START,
      payload: {
        id,
      },
    });

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

      dispatch({
        type: TODO_ACTIONS.COMPLETE_TODO_SUCCESS,
      });
    } catch (error) {
      dispatch({
        type: TODO_ACTIONS.COMPLETE_TODO_ERROR,
        payload: {
          id,
          originTodo,
          message: error.message,
        },
      });
    }
  }

  async function updateTodo(editedTodo) {
    const originTodo = todoList.find((todo) => todo.id === editedTodo.id);

    dispatch({
      type: TODO_ACTIONS.UPDATE_TODO_START,
      payload: {
        editedTodo,
      },
    });

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

      dispatch({
        type: TODO_ACTIONS.UPDATE_TODO_SUCCESS,
      });
    } catch (error) {
      dispatch({
        type: TODO_ACTIONS.UPDATE_TODO_ERROR,
        payload: {
          id: editedTodo.id,
          originTodo,
          message: error.message,
        },
      });
    }
  }

  return (
    <div>
      {error ? (
        <div>
          <p className="error">{error}</p>
          <button
            type="button"
            onClick={() =>
              dispatch({
                type: TODO_ACTIONS.CLEAR_ERROR,
              })
            }
          >
            Clear error
          </button>
        </div>
      ) : null}

      {filterError ? (
        <div>
          <p className="error">{filterError}</p>

          <button
            type="button"
            onClick={() =>
              dispatch({
                type: TODO_ACTIONS.CLEAR_FILTER_ERROR,
              })
            }
          >
            Clear filter error
          </button>

          <button
            type="button"
            onClick={() =>
              dispatch({
                type: TODO_ACTIONS.RESET_FILTERS,
              })
            }
          >
            Reset filters
          </button>
        </div>
      ) : null}

      {isTodoListLoading ? <p className="loading">Loading todos...</p> : null}
      <h2>Todos Page</h2>
      <SortBy
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSortByChange={(newSortBy) =>
          dispatch({
            type: TODO_ACTIONS.SET_SORT,
            payload: {
              sortBy: newSortBy,
              sortDirection: sortDirection,
            },
          })
        }
        onSortDirectionChange={(newSortDirection) =>
          dispatch({
            type: TODO_ACTIONS.SET_SORT,
            payload: {
              sortBy: sortBy,
              sortDirection: newSortDirection,
            },
          })
        }
      />
      <StatusFilter />
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
        statusFilter={statusFilter}
      />
    </div>
  );
}
