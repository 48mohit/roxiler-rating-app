import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { homePathForRole } from '../../utils/roles';
import {
  validateName,
  validateEmail,
  validateAddress,
  validatePassword,
} from '../../utils/validators';

function Signup() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', address: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to={homePathForRole(user.role)} replace />;
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

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
      await api.post('/auth/register', {
        name: form.name.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        password: form.password,
      });
      navigate('/login', {
        replace: true,
        state: { message: 'Registration successful. Please login.' },
      });
    } catch (err) {
      setServerError(err.response?.data?.message || 'Cannot reach the server. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const field = (label, name, type = 'text') => (
    <div style={{ marginBottom: 12 }}>
      <label>{label}</label>
      <br />
      {name === 'address' ? (
        <textarea
          name={name}
          value={form[name]}
          onChange={handleChange}
          rows={3}
          style={{ width: '100%', padding: 8 }}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={form[name]}
          onChange={handleChange}
          style={{ width: '100%', padding: 8 }}
        />
      )}
      {errors[name] && <div style={{ color: 'crimson', fontSize: 13 }}>{errors[name]}</div>}
    </div>
  );

  return (
    <div style={{ maxWidth: 420, margin: '40px auto', padding: 24, fontFamily: 'sans-serif' }}>
      <h1>Sign up</h1>
      <form onSubmit={handleSubmit} noValidate>
        {field('Name (20 to 60 characters)', 'name')}
        {field('Email', 'email', 'email')}
        {field('Address (max 400 characters)', 'address')}
        {field('Password (8 to 16 characters, 1 capital, 1 special)', 'password', 'password')}
        {serverError && <p style={{ color: 'crimson' }}>{serverError}</p>}
        <button type="submit" disabled={loading} style={{ padding: '8px 16px' }}>
          {loading ? 'Creating account...' : 'Sign up'}
        </button>
      </form>
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}

export default Signup;