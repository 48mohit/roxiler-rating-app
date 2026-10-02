import { useState } from 'react';
import api from '../../services/api';
import { validatePassword } from '../../utils/validators';

function ChangePassword() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
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
      currentPassword: form.currentPassword ? '' : 'Current password is required',
      newPassword: validatePassword(form.newPassword),
      confirmPassword:
        form.confirmPassword === form.newPassword ? '' : 'Passwords do not match',
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    setLoading(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setSuccess('Password updated successfully');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setServerError(err.response?.data?.message || 'Cannot reach the server. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const field = (label, name) => (
    <div style={{ marginBottom: 12 }}>
      <label>{label}</label>
      <br />
      <input
        type="password"
        name={name}
        value={form[name]}
        onChange={handleChange}
        style={{ width: '100%', padding: 8 }}
      />
      {errors[name] && <div style={{ color: 'crimson', fontSize: 13 }}>{errors[name]}</div>}
    </div>
  );

  return (
    <div style={{ maxWidth: 420 }}>
      <h1>Change Password</h1>
      <form onSubmit={handleSubmit} noValidate>
        {field('Current password', 'currentPassword')}
        {field('New password (8 to 16 characters, 1 capital, 1 special)', 'newPassword')}
        {field('Confirm new password', 'confirmPassword')}
        {serverError && <p style={{ color: 'crimson' }}>{serverError}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}
        <button type="submit" disabled={loading} style={{ padding: '8px 16px' }}>
          {loading ? 'Updating...' : 'Update password'}
        </button>
      </form>
    </div>
  );
}

export default ChangePassword;