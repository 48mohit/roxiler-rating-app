import { useEffect, useState } from 'react';
import api from '../../services/api';

const cardStyle = {
  flex: '1 1 200px',
  padding: 20,
  border: '1px solid #ccc',
  borderRadius: 8,
  background: '#f7f9fc',
};

function StatCard({ label, value }) {
  return (
    <div style={cardStyle}>
      <div style={{ fontSize: 14, color: '#666' }}>{label}</div>
      <div style={{ fontSize: 34, fontWeight: 'bold', marginTop: 8 }}>{value}</div>
    </div>
  );
}

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin/dashboard')
      .then((res) => setStats(res.data.data))
      .catch((err) => setError(err.response?.data?.message || 'Could not load the dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p style={{ color: 'crimson' }}>{error}</p>;

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 16 }}>
        <StatCard label="Total users" value={stats.totalUsers} />
        <StatCard label="Total stores" value={stats.totalStores} />
        <StatCard label="Total ratings" value={stats.totalRatings} />
      </div>
    </div>
  );
}

export default AdminDashboard;