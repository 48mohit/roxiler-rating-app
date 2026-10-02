import { useCallback, useEffect, useState } from 'react';
import api from '../../services/api';
import StarRating from '../../components/StarRating';
import SortableTh from '../../components/SortableTh';

const cellStyle = { padding: 10, borderBottom: '1px solid #ddd' };

const cardStyle = {
  flex: '1 1 200px',
  padding: 16,
  border: '1px solid #ccc',
  borderRadius: 8,
  background: '#f7f9fc',
};

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

function OwnerDashboard() {
  const [data, setData] = useState(null);
  const [sort, setSort] = useState({ sortBy: 'date', order: 'desc' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await api.get('/owner/dashboard', {
        params: { sortBy: sort.sortBy, order: sort.order },
      });
      setData(res.data.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load the dashboard');
    } finally {
      setLoading(false);
    }
  }, [sort]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleSort = (column) => {
    setSort((prev) =>
      prev.sortBy === column
        ? { sortBy: column, order: prev.order === 'asc' ? 'desc' : 'asc' }
        : { sortBy: column, order: 'asc' }
    );
  };

  const sortProps = { sortBy: sort.sortBy, order: sort.order, onSort: handleSort };

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p style={{ color: 'crimson' }}>{error}</p>;

  if (!data.store) {
    return (
      <div>
        <h1>Store Owner Dashboard</h1>
        <p>No store is linked to your account yet. Please contact the administrator.</p>
      </div>
    );
  }

  const { store, ratings } = data;

  return (
    <div>
      <h1>{store.name}</h1>
      <p style={{ color: '#555' }}>
        {store.address} | {store.email}
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, margin: '16px 0 24px' }}>
        <div style={cardStyle}>
          <div style={{ fontSize: 13, color: '#666' }}>Average rating</div>
          <div style={{ fontSize: 22, marginTop: 6 }}>
            <StarRating value={store.averageRating} />
          </div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: 13, color: '#666' }}>Total ratings</div>
          <div style={{ fontSize: 26, marginTop: 6 }}>{store.totalRatings}</div>
        </div>
      </div>

      <h2>Users who rated your store</h2>

      {ratings.length === 0 ? (
        <p>No one has rated your store yet.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <SortableTh label="User Name" column="name" {...sortProps} />
                <SortableTh label="Email" column="email" {...sortProps} />
                <SortableTh label="Rating" column="rating" {...sortProps} />
                <SortableTh label="Date" column="date" {...sortProps} />
              </tr>
            </thead>
            <tbody>
              {ratings.map((row) => (
                <tr key={row.userId}>
                  <td style={cellStyle}>{row.name}</td>
                  <td style={cellStyle}>{row.email}</td>
                  <td style={cellStyle}>
                    <StarRating value={row.rating} />
                  </td>
                  <td style={cellStyle}>{formatDate(row.updatedAt || row.submittedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default OwnerDashboard;