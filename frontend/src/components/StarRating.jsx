// Shows a rating as stars, for example: ★★★★☆ 4.0
function StarRating({ value }) {
  if (value === null || value === undefined) {
    return <span style={{ color: '#888' }}>No ratings yet</span>;
  }

  const filled = Math.round(value);
  return (
    <span>
      <span style={{ color: '#e0a800' }}>
        {'★'.repeat(filled)}
        {'☆'.repeat(5 - filled)}
      </span>{' '}
      {Number(value).toFixed(1)}
    </span>
  );
}

export default StarRating;