export default function SortBy({
  sortBy,
  sortDirection,
  onSortByChange,
  onSortDirectionChange,
}) {
  return (
    <div>
      <label htmlFor="sortBy">Sort By</label>
      <select
        id="sortBy"
        value={sortBy}
        onChange={(event) => onSortByChange(event.target.value)}
      >
        <option>Creation Date</option>
        <option>Title</option>
      </select>

      <label htmlFor="sortDirection">Order</label>

      <select
        id="sortDirection"
        value={sortDirection}
        onChange={(event) => onSortDirectionChange(event.target.value)}
      >
        <option>Descending</option>
        <option>Ascending</option>
      </select>
    </div>
  );
}
