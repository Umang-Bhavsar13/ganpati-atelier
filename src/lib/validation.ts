import { z } from "zod";

const imageSource = z.union([z.url(), z.string().regex(/^\/uploads\/[a-zA-Z0-9._-]+$/)]);
const optionalUrl = z.union([z.literal(""), imageSource]).optional();

export const categoryInput = z.object({
  name: z.string().trim().min(2).max(60),
  slug: z.string().trim().min(2).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  enabled: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
});

export const variantInput = z.object({
  name: z.string().trim().min(1).max(40),
  colorHex: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#B96546"),
  imageUrl: optionalUrl,
  stock: z.number().int().min(0).default(0),
  enabled: z.boolean().default(true),
});

export const productInput = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z.string().trim().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().max(5000).default(""),
  price: z.number().int().positive(),
  stock: z.number().int().min(0).default(0),
  height: z.string().max(80).default(""),
  imageUrl: imageSource,
  gallery: z.array(imageSource).max(12).default([]),
  attributes: z.record(z.string(), z.string()).default({}),
  featured: z.boolean().default(false),
  enabled: z.boolean().default(true),
  categoryId: z.string().min(1),
  variants: z.array(variantInput).default([]),
});

export const sectionInput = z.object({
  type: z.string().trim().min(2).max(40),
  heading: z.string().trim().min(2).max(100),
  description: z.string().max(500).default(""),
  imageUrl: optionalUrl,
  productIds: z.array(z.string()).default([]),
  enabled: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
});

export const checkoutInput = z.object({
  customerName: z.string().trim().min(2).max(100),
  phone: z.string().trim().regex(/^[+\d][\d\s()-]{7,19}$/),
  email: z.email(),
  address: z.string().trim().min(8).max(300),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(80),
  pincode: z.string().trim().regex(/^\d{6}$/),
  notes: z.string().max(500).default(""),
  items: z.array(z.object({
    productId: z.string().min(1),
    variantId: z.string().optional(),
    quantity: z.number().int().min(1).max(10),
  })).min(1).max(20),
});