import { z, type ZodIssue } from 'zod';

// Sanitize string input to prevent XSS
const sanitizeString = (str: string) => {
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
};

// Slug validation regex - only lowercase letters, numbers, and hyphens
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const productSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .transform(sanitizeString),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(100, 'Slug must be less than 100 characters')
    .regex(slugRegex, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z
    .string()
    .max(5000, 'Description must be less than 5000 characters')
    .transform(sanitizeString)
    .optional()
    .or(z.literal('')),
  price: z
    .string()
    .min(1, 'Price is required')
    .refine((val) => !isNaN(parseFloat(val)), 'Price must be a valid number')
    .refine((val) => parseFloat(val) >= 0, 'Price must be a positive number')
    .refine((val) => parseFloat(val) <= 1000000, 'Price must be less than 1,000,000'),
  status: z.enum(['draft', 'published', 'sold']),
  product_code: z
    .string()
    .max(50, 'Product code must be less than 50 characters')
    .transform(sanitizeString)
    .optional()
    .or(z.literal('')),
  details: z
    .string()
    .max(5000, 'Details must be less than 5000 characters')
    .transform(sanitizeString)
    .optional()
    .or(z.literal('')),
});

export const collectionSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .transform(sanitizeString),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(100, 'Slug must be less than 100 characters')
    .regex(slugRegex, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z
    .string()
    .max(5000, 'Description must be less than 5000 characters')
    .transform(sanitizeString)
    .optional()
    .or(z.literal('')),
  display_order: z
    .number()
    .int('Display order must be a whole number')
    .min(0, 'Display order must be 0 or greater')
    .max(9999, 'Display order must be less than 10000'),
  is_active: z.boolean(),
  is_featured: z.boolean(),
});

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(254, 'Email must be less than 254 characters'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export type ProductFormErrors = Partial<Record<keyof z.infer<typeof productSchema>, string>>;
export type CollectionFormErrors = Partial<Record<keyof z.infer<typeof collectionSchema>, string>>;
export type LoginFormErrors = Partial<Record<keyof z.infer<typeof loginSchema>, string>>;

export function validateProduct(data: unknown): { success: true; data: z.infer<typeof productSchema> } | { success: false; errors: ProductFormErrors } {
  const result = productSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: ProductFormErrors = {};
  (result.error.issues as ZodIssue[]).forEach((err) => {
    const field = err.path[0] as keyof z.infer<typeof productSchema>;
    if (!errors[field]) {
      errors[field] = err.message;
    }
  });
  return { success: false, errors };
}

export function validateCollection(data: unknown): { success: true; data: z.infer<typeof collectionSchema> } | { success: false; errors: CollectionFormErrors } {
  const result = collectionSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: CollectionFormErrors = {};
  (result.error.issues as ZodIssue[]).forEach((err) => {
    const field = err.path[0] as keyof z.infer<typeof collectionSchema>;
    if (!errors[field]) {
      errors[field] = err.message;
    }
  });
  return { success: false, errors };
}

export function validateLogin(data: unknown): { success: true; data: z.infer<typeof loginSchema> } | { success: false; errors: LoginFormErrors } {
  const result = loginSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: LoginFormErrors = {};
  (result.error.issues as ZodIssue[]).forEach((err) => {
    const field = err.path[0] as keyof z.infer<typeof loginSchema>;
    if (!errors[field]) {
      errors[field] = err.message;
    }
  });
  return { success: false, errors };
}
