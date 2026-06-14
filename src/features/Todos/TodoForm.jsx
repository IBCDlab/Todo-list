import styles from "./TodoForm.module.css";
import { useState } from "react";
import { useRef } from "react";
import DOMPurify from "dompurify";
import TextInputWithLabel from "../../shared/TextInputWithLabel";
import { isValidTodoTitle } from "../../utils/todoValidation";

export default function TodoForm({ onAddTodo }) {
  const inputRef = useRef();
  const [workingTodoTitle, setWorkingTodoTitle] = useState("");

  const handleAddTodo = (event) => {
    event.preventDefault();

    const cleanedTodoTitle = DOMPurify.sanitize(workingTodoTitle.trim(), {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
    });

    if (cleanedTodoTitle) {
      onAddTodo(cleanedTodoTitle);
      setWorkingTodoTitle("");
      inputRef.current.focus();
    }
  };

  return (
    <form className={styles.form} onSubmit={handleAddTodo}>
      <TextInputWithLabel
        ref={inputRef}
        value={workingTodoTitle}
        onChange={(event) => setWorkingTodoTitle(event.target.value)}
        elementId="todoTitle"
        labelText="Todo"
      />
      <button
        type="submit"
        className={styles.button}
        disabled={!isValidTodoTitle(workingTodoTitle)}
      >
        Add Todo
      </button>
    </form>
  );
}
