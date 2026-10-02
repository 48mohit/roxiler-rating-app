const { z } = require('zod');

// These rules come directly from the assignment.
const name = z
  .string()
  .trim()
  .min(20, 'Name must be at least 20 characters')
  .max(60, 'Name must be at most 60 characters');

const email = z.string().trim().toLowerCase().email('Enter a valid email address');

const address = z
  .string()
  .trim()
  .min(1, 'Address is required')
  .max(400, 'Address must be at most 400 characters');

const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(16, 'Password must be at most 16 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

const registerSchema = z.object({ name, email, address, password });

// Login only checks that fields are present. The real check is the database.
const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
});

// The NEW password must follow the same rules as signup.
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: password,
});

module.exports = { registerSchema, loginSchema, changePasswordSchema };