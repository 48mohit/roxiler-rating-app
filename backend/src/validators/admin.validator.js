const { z } = require('zod');
const { registerSchema } = require('./auth.validator');

// Same rules as signup (name, email, address, password), plus a role.
const createUserSchema = registerSchema.extend({
  role: z.enum(['ADMIN', 'USER', 'STORE_OWNER'], {
    message: 'Role must be ADMIN, USER or STORE_OWNER',
  }),
});

// Store uses the same name, email and address rules, plus the owner's id.
const createStoreSchema = registerSchema
  .pick({ name: true, email: true, address: true })
  .extend({
    ownerId: z.coerce
      .number()
      .int('Owner id must be a whole number')
      .positive('Owner is required'),
  });

module.exports = { createUserSchema, createStoreSchema };