import { useState } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function Logoff() {
  const { logout } = useAuth();
  const [error, setError] = useState("");

  async function handleLogoff() {
    const result = await logout();
    if (!result.success) {
      setError(result.error);
    }
  }

  return (
    <>
      {error && <p>{error}</p>}
      <button type="button" onClick={handleLogoff}>
        Log Off
      </button>
    </>
  );
}
