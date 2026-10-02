// A table header that can be clicked to sort. Shows an arrow on the active column.
function SortableTh({ label, column, sortBy, order, onSort }) {
  const active = sortBy === column;
  const arrow = active ? (order === 'asc' ? ' ▲' : ' ▼') : '';

  return (
    <th
      onClick={() => onSort(column)}
      style={{
        cursor: 'pointer',
        textAlign: 'left',
        padding: 10,
        background: '#d9e2f3',
        borderBottom: '2px solid #bbb',
        whiteSpace: 'nowrap',
        userSelect: 'none',
      }}
    >
      {label}
      {arrow}
    </th>
  );
}

export default SortableTh;