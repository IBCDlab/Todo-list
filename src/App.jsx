import TodosPage from "./features/Todos/TodosPage.jsx";
import Header from "./shared/Header.jsx";
import Logon from "./features/Logon.jsx";
import { useAuth } from "./contexts/AuthContext.jsx";
import "./App.css";

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <div>
      <Header />
      {isAuthenticated ? <TodosPage /> : <Logon />}
    </div>
  );
}
