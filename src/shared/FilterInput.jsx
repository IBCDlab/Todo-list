import styles from "./FilterInput.module.css";

export default function FilterInput({ filterTerm, onFilterChange }) {
  return (
    <div className={styles.group}>
      <label htmlFor="filterInput"> Search todos:</label>

      <input
        className={styles.input}
        id="filterInput"
        type="text"
        value={filterTerm}
        onChange={(e) => onFilterChange(e.target.value)}
        placeholder="Search by title..."
      />
    </div>
  );
}
