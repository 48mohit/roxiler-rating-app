import { useCallback, useEffect, useState } from 'react';
import api from '../../services/api';
import StarRating from '../../components/StarRating';
import SortableTh from '../../components/SortableTh';

const cellStyle = { padding: 10, borderBottom: '1px solid #ddd', verticalAlign: 'top' };

// The "Rate" or "Modify" part of one row.
function RateCell({ store, onSaved }) {
  const hasRated = store.myRating !== null;
  const [value, setValue] = useState(hasRated ? String(store.myRating) : '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!value) {
      setError('Choose a rating');
      return;
    }
    setError('');
    setSaving(true);
    try {
      const body = { rating: Number(value) };
      if (hasRated) {
        await api.put(`/stores/${store.id}/ratings`, body);
      } else {
        await api.post(`/stores/${store.id}/ratings`, body);
      }
      await onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save the rating');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <select value={value} onChange={(e) => setValue(e.target.value)} style={{ padding: 4 }}>
        <option value="">Select</option>
        {[1, 2, 3, 4, 5].map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>{' '}
      <button onClick={handleSave} disabled={saving} style={{ padding: '4px 10px' }}>
        {saving ? 'Saving...' : hasRated ? 'Modify' : 'Submit'}
      </button>
      {error && <div style={{ color: 'crimson', fontSize: 13 }}>{error}</div>}
    </div>
  );
}

function Stores() {
  const [stores, setStores] = useState([]);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [sort, setSort] = useState({ sortBy: 'name', order: 'asc' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStores = useCallback(async () => {
    try {
      const res = await api.get('/stores', {
        params: { name, address, sortBy: sort.sortBy, order: sort.order },
      });
      setStores(res.data.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load stores');
    } finally {
      setLoading(false);
    }
  }, [name, address, sort]);

  // Wait 300 ms after the user stops typing, so we do not call the server on every key.
  useEffect(() => {
    const timer = setTimeout(fetchStores, 300);
    return () => clearTimeout(timer);
  }, [fetchStores]);

  const handleSort = (column) => {
    setSort((prev) =>
      prev.sortBy === column
        ? { sortBy: column, order: prev.order === 'asc' ? 'desc' : 'asc' }
        : { sortBy: column, order: 'asc' }
    );
  };

  const sortProps = { sortBy: sort.sortBy, order: sort.order, onSort: handleSort };

  return (
    <div>
      <h1>Stores</h1>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <input
          placeholder="Search by store name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: 8, minWidth: 220 }}
        />
        <input
          placeholder="Search by address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          style={{ padding: 8, minWidth: 220 }}
        />
      </div>

      {loading && <p>Loading stores...</p>}
      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      {!loading && !error && stores.length === 0 && <p>No stores found.</p>}

      {stores.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <SortableTh label="Store Name" column="name" {...sortProps} />
                <SortableTh label="Address" column="address" {...sortProps} />
                <SortableTh label="Overall Rating" column="rating" {...sortProps} />
                <th style={{ textAlign: 'left', padding: 10, background: '#d9e2f3', borderBottom: '2px solid #bbb' }}>
                  My Rating
                </th>
                <th style={{ textAlign: 'left', padding: 10, background: '#d9e2f3', borderBottom: '2px solid #bbb' }}>
                  Rate this store
                </th>
              </tr>
            </thead>
            <tbody>
              {stores.map((store) => (
                <tr key={store.id}>
                  <td style={cellStyle}>{store.name}</td>
                  <td style={cellStyle}>{store.address}</td>
                  <td style={cellStyle}>
                    <StarRating value={store.rating} />
                    {store.totalRatings > 0 && (
                      <div style={{ fontSize: 12, color: '#666' }}>
                        {store.totalRatings} rating{store.totalRatings > 1 ? 's' : ''}
                      </div>
                    )}
                  </td>
                  <td style={cellStyle}>
                    {store.myRating !== null ? (
                      <StarRating value={store.myRating} />
                    ) : (
                      <span style={{ color: '#888' }}>Not rated</span>
                    )}
                  </td>
                  <td style={cellStyle}>
                    <RateCell store={store} onSaved={fetchStores} />
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

export default Stores;
