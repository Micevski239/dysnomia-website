import { z } from 'zod';

export const checkoutSchema = z.object({
  // Contact Information
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^[\d\s\-+()]+$/, 'Please enter a valid phone number'),

  // Shipping Address
  fullName: z
    .string()
    .min(1, 'Full name is required')
    .min(2, 'Name must be at least 2 characters'),
  address: z
    .string()
    .min(1, 'Address is required')
    .min(5, 'Please enter a complete address'),
  city: z
    .string()
    .min(1, 'City is required'),
  postalCode: z
    .string()
    .min(1, 'Postal code is required'),
  country: z
    .string()
    .min(1, 'Country is required'),

  // Optional
  notes: z.string().optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;

export function validateCheckoutForm(data: unknown): {
  success: boolean;
  data?: CheckoutFormData;
  errors?: Record<string, string>;
} {
  const result = checkoutSchema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};
  result.error.issues.forEach((issue) => {
    const path = issue.path.join('.');
    if (!errors[path]) {
      errors[path] = issue.message;
    }
  });

  return { success: false, errors };
}

export const countryOptions = [
  { value: 'MK', label: 'North Macedonia' },
  { value: 'AL', label: 'Albania' },
  { value: 'BG', label: 'Bulgaria' },
  { value: 'GR', label: 'Greece' },
  { value: 'RS', label: 'Serbia' },
  { value: 'XK', label: 'Kosovo' },
  { value: 'ME', label: 'Montenegro' },
  { value: 'HR', label: 'Croatia' },
  { value: 'SI', label: 'Slovenia' },
  { value: 'AT', label: 'Austria' },
  { value: 'DE', label: 'Germany' },
  { value: 'IT', label: 'Italy' },
  { value: 'FR', label: 'France' },
  { value: 'NL', label: 'Netherlands' },
  { value: 'BE', label: 'Belgium' },
  { value: 'CH', label: 'Switzerland' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'AU', label: 'Australia' },
];
