// Same rules as the backend (zod). The backend still checks everything again.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateName = (value) => {
  const v = value.trim();
  if (v.length < 20) return 'Name must be at least 20 characters';
  if (v.length > 60) return 'Name must be at most 60 characters';
  return '';
};

export const validateEmail = (value) =>
  EMAIL_REGEX.test(value.trim()) ? '' : 'Enter a valid email address';

export const validateAddress = (value) => {
  const v = value.trim();
  if (v.length === 0) return 'Address is required';
  if (v.length > 400) return 'Address must be at most 400 characters';
  return '';
};

export const validatePassword = (value) => {
  if (value.length < 8) return 'Password must be at least 8 characters';
  if (value.length > 16) return 'Password must be at most 16 characters';
  if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter';
  if (!/[^A-Za-z0-9]/.test(value)) return 'Password must contain at least one special character';
  return '';
};