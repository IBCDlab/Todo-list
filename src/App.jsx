import "./App.css";
import TodosPage from "./features/Todos/TodosPage.jsx";
import Header from "./shared/Header.jsx";
import Logon from "./features/Logon.jsx";

export default function App() {
  return (
    <div>
      <Header />
      <Logon />
      <TodosPage />
    </div>
  );
}
