import styles from "./TodoListItem.module.css";

import { useState } from "react";
import DOMPurify from "dompurify";
import TextInputWithLabel from "../../../shared/TextInputWithLabel";
import { isValidTodoTitle } from "../../../utils/todoValidation";

export default function TodoListItem({ todo, onCompleteTodo, onUpdateTodo }) {
  const [isEditing, setIsEditing] = useState(false);
  const [workingTitle, setWorkingTitle] = useState(todo.title);

  function handleCancel() {
    setWorkingTitle(todo.title);
    setIsEditing(false);
  }

  function handleEdit(event) {
    setWorkingTitle(event.target.value);
  }

  function handleUpdate(event) {
    if (!isEditing) {
      return;
    }

    event.preventDefault();

    const cleanedTodoTitle = DOMPurify.sanitize(workingTitle.trim(), {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
    });

    if (!cleanedTodoTitle) {
      return;
    }

    onUpdateTodo({
      ...todo,
      title: workingTitle,
    });

    setIsEditing(false);
  }

  return (
    <li className={styles.item}>
      <form onSubmit={handleUpdate}>
        {isEditing ? (
          <>
            <TextInputWithLabel
              elementId={`editTodo-${todo.id}`}
              labelText="Todo"
              value={workingTitle}
              onChange={handleEdit}
            />
            <button
              className={styles.button}
              type="button"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              className={styles.button}
              type="button"
              onClick={handleUpdate}
              disabled={!isValidTodoTitle(workingTitle)}
            >
              Update
            </button>
          </>
        ) : (
          <>
            <label>
              <input
                type="checkbox"
                id={`checkbox${todo.id}`}
                checked={todo.isCompleted}
                onChange={() => onCompleteTodo(todo.id)}
              />
            </label>

            <span
              className={todo.isCompleted ? styles.completed : ""}
              onClick={() => setIsEditing(true)}
            >
              {todo.title}
            </span>
          </>
        )}
      </form>
    </li>
  );
}
