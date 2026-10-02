import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../services/api';
import StarRating from '../../components/StarRating';

const rowStyle = { padding: '8px 0', borderBottom: '1px solid #eee' };

function UserDetails() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/admin/users/${id}`)
      .then((res) => {
        setUser(res.data.data);
        setError('');
      })
      .catch((err) => setError(err.response?.data?.message || 'Could not load the user'))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div style={{ maxWidth: 560 }}>
      <p>
        <Link to="/admin/users">&larr; Back to users</Link>
      </p>
      <h1>User details</h1>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      {user && (
        <div>
          <div style={rowStyle}><strong>Name:</strong> {user.name}</div>
          <div style={rowStyle}><strong>Email:</strong> {user.email}</div>
          <div style={rowStyle}><strong>Address:</strong> {user.address}</div>
          <div style={rowStyle}><strong>Role:</strong> {user.role}</div>

          {user.role === 'STORE_OWNER' && (
            <div style={{ marginTop: 20 }}>
              <h2>Store</h2>
              {user.store ? (
                <div>
                  <div style={rowStyle}><strong>Store name:</strong> {user.store.name}</div>
                  <div style={rowStyle}>
                    <strong>Rating:</strong> <StarRating value={user.store.rating} />
                  </div>
                  <div style={rowStyle}><strong>Total ratings:</strong> {user.store.totalRatings}</div>
                </div>
              ) : (
                <p>No store is linked to this owner yet.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default UserDetails;