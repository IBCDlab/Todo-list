import { NavLink } from "react-router";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function Navigation() {

    const { isAuthenticated } = useAuth();
    const navLinkStyle = ({ isActive }) => {
        if (isActive) {
            return {
                fontWeight: "bold", textDecoration: "underline",
            };
  } else {
    return {};
  }
};

  return (
    <nav>
      <ul
        style={{
          listStyle: "none",
          display: "flex",
          gap: "1rem",
          padding: 0,
        }}
      >
        <li>
          <NavLink to="/about" style={navLinkStyle}>
            About
          </NavLink>
        </li>
        {!isAuthenticated ? (
          <li>
            <NavLink to="/login" style={navLinkStyle}>
              Login
            </NavLink>
          </li>
        ) : null}
        {isAuthenticated ? (
          <>
            <li>
              <NavLink to="/todos" style={navLinkStyle}>
                Todos
              </NavLink>
            </li>

            <li>
              <NavLink to="/profile" style={navLinkStyle}>
                Profile
              </NavLink>
            </li>
          </>
        ) : null}
      </ul>
    </nav>
  );
}