// Query values can be strings OR arrays (?name=a&name=b). We accept only plain strings.
const asText = (value) => (typeof value === 'string' ? value.trim() : '');

// Turns ?sortBy=...&order=... into a SAFE column and direction.
// Only keys present in allowedColumns are used, so users can never inject SQL.
function parseSort(sortBy, order, allowedColumns, defaultKey) {
  const key = Object.prototype.hasOwnProperty.call(allowedColumns, sortBy)
    ? sortBy
    : defaultKey;
  const direction = String(order).toLowerCase() === 'desc' ? 'DESC' : 'ASC';
  return { column: allowedColumns[key], direction };
}

module.exports = { asText, parseSort };