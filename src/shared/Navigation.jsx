import { NavLink } from "react-router";
import { useAuth } from "../contexts/AuthContext.jsx";
import styles from "./Navigation.module.css";

export default function Navigation() {
  const { isAuthenticated } = useAuth();
  const navLinkClass = ({ isActive }) => (isActive ? styles.activeLink : "");

  return (
    <nav>
      <ul className={styles.navList}>
        <li>
          <NavLink to="/about" className={navLinkClass}>
            About
          </NavLink>
        </li>
        {!isAuthenticated ? (
          <li>
            <NavLink to="/login" className={navLinkClass}>
              Login
            </NavLink>
          </li>
        ) : null}
        {isAuthenticated ? (
          <>
            <li>
              <NavLink to="/todos" className={navLinkClass}>
                Todos
              </NavLink>
            </li>

            <li>
              <NavLink to="/profile" className={navLinkClass}>
                Profile
              </NavLink>
            </li>
          </>
        ) : null}
      </ul>
    </nav>
  );
}
