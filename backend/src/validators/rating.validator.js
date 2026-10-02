const { z } = require('zod');

// Only whole numbers 1 to 5. Strings like "5" or "abc" are rejected.
const ratingSchema = z.object({
  rating: z
    .number({ message: 'Rating must be a number from 1 to 5' })
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),
});

module.exports = { ratingSchema };