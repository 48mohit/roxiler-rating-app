import { useEffect, useState } from 'react';
import api from '../../services/api';
import { validateName, validateEmail, validateAddress } from '../../utils/validators';

const EMPTY_FORM = { name: '', email: '', address: '', ownerId: '' };

function AddStore() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [owners, setOwners] = useState([]);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Load all store owners for the dropdown.
  useEffect(() => {
    api
      .get('/admin/users', { params: { role: 'STORE_OWNER', sortBy: 'name', order: 'asc' } })
      .then((res) => setOwners(res.data.data))
      .catch(() => setServerError('Could not load store owners'));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccess('');

    const newErrors = {
      name: validateName(form.name),
      email: validateEmail(form.email),
      address: validateAddress(form.address),
      ownerId: form.ownerId ? '' : 'Select a store owner',
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    setLoading(true);
    try {
      await api.post('/admin/stores', {
        name: form.name.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        ownerId: Number(form.ownerId),
      });
      setSuccess(`Store created: ${form.name.trim()}`);
      setForm(EMPTY_FORM);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Cannot reach the server. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const error = (name) =>
    errors[name] && <div style={{ color: 'crimson', fontSize: 13 }}>{errors[name]}</div>;

  return (
    <div style={{ maxWidth: 440 }}>
      <h1>Add Store</h1>
      <form onSubmit={handleSubmit} noValidate>
        <div style={{ marginBottom: 12 }}>
          <label>Store name (20 to 60 characters)</label>
          <br />
          <input name="name" value={form.name} onChange={handleChange} style={{ width: '100%', padding: 8 }} />
          {error('name')}
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Store email</label>
          <br />
          <input name="email" type="email" value={form.email} onChange={handleChange} style={{ width: '100%', padding: 8 }} />
          {error('email')}
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Address (max 400 characters)</label>
          <br />
          <textarea name="address" rows={3} value={form.address} onChange={handleChange} style={{ width: '100%', padding: 8 }} />
          {error('address')}
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Store owner</label>
          <br />
          <select name="ownerId" value={form.ownerId} onChange={handleChange} style={{ width: '100%', padding: 8 }}>
            <option value="">Select owner</option>
            {owners.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name} ({o.email})
              </option>
            ))}
          </select>
          {error('ownerId')}
          {owners.length === 0 && (
            <div style={{ fontSize: 13, color: '#666' }}>
              No store owners yet. Create one first from Add User.
            </div>
          )}
        </div>

        {serverError && <p style={{ color: 'crimson' }}>{serverError}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}

        <button type="submit" disabled={loading} style={{ padding: '8px 16px' }}>
          {loading ? 'Creating...' : 'Create store'}
        </button>
      </form>
    </div>
  );
}

export default AddStore;