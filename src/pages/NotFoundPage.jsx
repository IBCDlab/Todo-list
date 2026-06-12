import { Link } from "react-router";
export default function NotFoundPage() {
  return (
    <div>
      <h1>404</h1>
      <p>Page not found</p>
      <p>
        <Link to="/">Home</Link>
      </p>
      <p>
        <Link to="/login">Login</Link>
      </p>
      <p>
        <Link to="/todos">Todos</Link>
      </p>
    </div>
);
}


