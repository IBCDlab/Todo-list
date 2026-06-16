import { useEffect } from "react";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function ProfilePage() {
  const { email, token } = useAuth();
  const [totalTodos, setTotalTodos] = useState(0);
  const [completedTodos, setCompletedTodos] = useState(0);
  const [activeTodos, setActiveTodos] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchTodoStats() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/tasks", {
          headers: {
            "X-CSRF-TOKEN": token,
          },
          credentials: "include",
        });

        if (response.status === 401) {
          throw new Error("Unauthorized");
        }

        if (!response.ok) {
          throw new Error("Failed to fetch todos");
        }

        const data = await response.json();
        const todos = data.tasks;
        
        const total = todos.length;
        const completed = todos.filter((todo) => todo.isCompleted).length;
        const active = total - completed;

        setTotalTodos(total);
        setCompletedTodos(completed);
        setActiveTodos(active);
      } catch (err) {
        setError(`Error loading statistics: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      fetchTodoStats();
    }
  }, [token]);

  const completionPercent =
    totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;

  return (
    <div>
      <h1>Profile</h1>
      <h2>User Information</h2>

      <p>Email: {email}</p>
      <p>Status: Authenticated</p>

      <h2>Todo Statistics</h2>

      {loading ? (
        <p className="loading">Loading statistics...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <>
          <p>Total todos: {totalTodos}</p>
          <p>Completed todos: {completedTodos}</p>
          <p>Active todos: {activeTodos}</p>
          <p>Completion: {completionPercent}%</p>
        </>
      )}
    </div>
  );
}
