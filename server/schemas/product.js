const { z } = require('zod');

const RawProductSchema = z.object({
  name: z.string().min(1),
  priceText: z.string().min(1),
  originalPrice: z.number().positive().nullable().optional(),
  image: z.string().optional().default(''),
  link: z.string().optional().default(''),
  brand: z.string().optional().default(''),
  packageSize: z.string().optional().default(''),
});

const ProductSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  price: z.number().positive(),
  originalPrice: z.number().positive().nullable().default(null),
  image: z.string(),
  url: z.string(),
  store: z.string(),
  inStock: z.boolean(),
  unit: z.string(),
  description: z.string(),
});

module.exports = { RawProductSchema, ProductSchema };
