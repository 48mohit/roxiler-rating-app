import { useCallback, useEffect, useState } from 'react';
import api from '../../services/api';
import StarRating from '../../components/StarRating';
import SortableTh from '../../components/SortableTh';

const cellStyle = { padding: 10, borderBottom: '1px solid #ddd', verticalAlign: 'top' };

function AdminStores() {
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({ name: '', email: '', address: '' });
  const [sort, setSort] = useState({ sortBy: 'name', order: 'asc' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStores = useCallback(async () => {
    try {
      const res = await api.get('/admin/stores', {
        params: { ...filters, sortBy: sort.sortBy, order: sort.order },
      });
      setStores(res.data.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load stores');
    } finally {
      setLoading(false);
    }
  }, [filters, sort]);

  // Wait 300 ms after the user stops typing, so we do not call the server on every key.
  useEffect(() => {
    const timer = setTimeout(fetchStores, 300);
    return () => clearTimeout(timer);
  }, [fetchStores]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSort = (column) => {
    setSort((prev) =>
      prev.sortBy === column
        ? { sortBy: column, order: prev.order === 'asc' ? 'desc' : 'asc' }
        : { sortBy: column, order: 'asc' }
    );
  };

  const sortProps = { sortBy: sort.sortBy, order: sort.order, onSort: handleSort };
  const inputStyle = { padding: 8, minWidth: 180 };

  return (
    <div>
      <h1>Stores</h1>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <input name="name" placeholder="Filter by name" value={filters.name} onChange={handleFilterChange} style={inputStyle} />
        <input name="email" placeholder="Filter by email" value={filters.email} onChange={handleFilterChange} style={inputStyle} />
        <input name="address" placeholder="Filter by address" value={filters.address} onChange={handleFilterChange} style={inputStyle} />
      </div>

      {loading && <p>Loading stores...</p>}
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      {!loading && !error && stores.length === 0 && <p>No stores found.</p>}

      {stores.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <SortableTh label="Name" column="name" {...sortProps} />
                <SortableTh label="Email" column="email" {...sortProps} />
                <SortableTh label="Address" column="address" {...sortProps} />
                <SortableTh label="Rating" column="rating" {...sortProps} />
              </tr>
            </thead>
            <tbody>
              {stores.map((s) => (
                <tr key={s.id}>
                  <td style={cellStyle}>{s.name}</td>
                  <td style={cellStyle}>{s.email}</td>
                  <td style={cellStyle}>{s.address}</td>
                  <td style={cellStyle}>
                    <StarRating value={s.rating} />
                    {s.totalRatings > 0 && (
                      <div style={{ fontSize: 12, color: '#666' }}>
                        {s.totalRatings} rating{s.totalRatings > 1 ? 's' : ''}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminStores;