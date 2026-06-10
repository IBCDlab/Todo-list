import { useEffect } from "react";
import { useLocation } from "react-router";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();

  const location = useLocation();

  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          from: location,
        },
      });
    }
  }, [isAuthenticated, location, navigate]);

  if (!isAuthenticated) {
    return <p>Redirecting...</p>;
  } else {
    return children;
  }
}