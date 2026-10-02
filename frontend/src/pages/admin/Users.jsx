import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import StarRating from '../../components/StarRating';
import SortableTh from '../../components/SortableTh';

const cellStyle = { padding: 10, borderBottom: '1px solid #ddd', verticalAlign: 'top' };
const plainTh = { textAlign: 'left', padding: 10, background: '#d9e2f3', borderBottom: '2px solid #bbb' };

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [sort, setSort] = useState({ sortBy: 'name', order: 'asc' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get('/admin/users', {
        params: { ...filters, sortBy: sort.sortBy, order: sort.order },
      });
      setUsers(res.data.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load users');
    } finally {
      setLoading(false);
    }
  }, [filters, sort]);

  // Wait 300 ms after the user stops typing, so we do not call the server on every key.
  useEffect(() => {
    const timer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

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
      <h1>Users</h1>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <input name="name" placeholder="Filter by name" value={filters.name} onChange={handleFilterChange} style={inputStyle} />
        <input name="email" placeholder="Filter by email" value={filters.email} onChange={handleFilterChange} style={inputStyle} />
        <input name="address" placeholder="Filter by address" value={filters.address} onChange={handleFilterChange} style={inputStyle} />
        <select name="role" value={filters.role} onChange={handleFilterChange} style={inputStyle}>
          <option value="">All roles</option>
          <option value="ADMIN">ADMIN</option>
          <option value="USER">USER</option>
          <option value="STORE_OWNER">STORE_OWNER</option>
        </select>
      </div>

      {loading && <p>Loading users...</p>}
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      {!loading && !error && users.length === 0 && <p>No users found.</p>}

      {users.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <SortableTh label="Name" column="name" {...sortProps} />
                <SortableTh label="Email" column="email" {...sortProps} />
                <SortableTh label="Address" column="address" {...sortProps} />
                <SortableTh label="Role" column="role" {...sortProps} />
                <SortableTh label="Rating" column="rating" {...sortProps} />
                <th style={plainTh}>Details</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td style={cellStyle}>{u.name}</td>
                  <td style={cellStyle}>{u.email}</td>
                  <td style={cellStyle}>{u.address}</td>
                  <td style={cellStyle}>{u.role}</td>
                  <td style={cellStyle}>
                    {u.role === 'STORE_OWNER' ? <StarRating value={u.rating} /> : '-'}
                  </td>
                  <td style={cellStyle}>
                    <Link to={`/admin/users/${u.id}`}>View</Link>
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

export default AdminUsers;