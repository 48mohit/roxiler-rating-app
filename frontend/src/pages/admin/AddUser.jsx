import { useState } from 'react';
import api from '../../services/api';
import {
  validateName,
  validateEmail,
  validateAddress,
  validatePassword,
} from '../../utils/validators';

const EMPTY_FORM = { name: '', email: '', address: '', password: '', role: 'USER' };

function AddUser() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

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
      password: validatePassword(form.password),
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    setLoading(true);
    try {
      await api.post('/admin/users', {
        name: form.name.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        password: form.password,
        role: form.role,
      });
      setSuccess(`User created: ${form.email.trim()} (${form.role})`);
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
      <h1>Add User</h1>
      <form onSubmit={handleSubmit} noValidate>
        <div style={{ marginBottom: 12 }}>
          <label>Name (20 to 60 characters)</label>
          <br />
          <input name="name" value={form.name} onChange={handleChange} style={{ width: '100%', padding: 8 }} />
          {error('name')}
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Email</label>
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
          <label>Password (8 to 16 characters, 1 capital, 1 special)</label>
          <br />
          <input name="password" type="password" value={form.password} onChange={handleChange} style={{ width: '100%', padding: 8 }} />
          {error('password')}
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Role</label>
          <br />
          <select name="role" value={form.role} onChange={handleChange} style={{ width: '100%', padding: 8 }}>
            <option value="USER">USER</option>
            <option value="STORE_OWNER">STORE_OWNER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>

        {serverError && <p style={{ color: 'crimson' }}>{serverError}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}

        <button type="submit" disabled={loading} style={{ padding: '8px 16px' }}>
          {loading ? 'Creating...' : 'Create user'}
        </button>
      </form>
    </div>
  );
}

export default AddUser;