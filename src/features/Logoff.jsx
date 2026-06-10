import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function Logoff() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  async function handleLogoff() {
    const result = await logout();
    if (result.success) {
      navigate("/login");
    } else {
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
