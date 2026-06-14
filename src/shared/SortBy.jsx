import styles from "./SortBy.module.css";

export default function SortBy({
  sortBy,
  sortDirection,
  onSortByChange,
  onSortDirectionChange,
}) {
  return (
    <div className={styles.group}>
      <label htmlFor="sortBy">Sort By</label>
      <select
        id="sortBy"
        value={sortBy}
        onChange={(event) => onSortByChange(event.target.value)}
      >
        <option value="creationDate">Creation Date</option>
        <option value="title">Title</option>
      </select>

      <label htmlFor="sortDirection">Order</label>

      <select
        id="sortDirection"
        value={sortDirection}
        onChange={(event) => onSortDirectionChange(event.target.value)}
      >
        <option value="desc">Descending</option>
        <option value="asc">Ascending</option>
      </select>
    </div>
  );
}
