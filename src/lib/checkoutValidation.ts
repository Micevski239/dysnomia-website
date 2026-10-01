import { z } from 'zod';

// Error messages are translation keys (namespace 'checkoutErrors' in
// LanguageContext); render them with t().

export const checkoutSchema = z.object({
  // Contact Information
  email: z
    .string()
    .min(1, 'checkoutErrors.emailRequired')
    .email('checkoutErrors.emailInvalid'),
  phone: z
    .string()
    .min(1, 'checkoutErrors.phoneRequired')
    .regex(/^[\d\s\-+()]+$/, 'checkoutErrors.phoneInvalid'),

  // Shipping Address
  fullName: z
    .string()
    .min(1, 'checkoutErrors.fullNameRequired')
    .min(2, 'checkoutErrors.fullNameTooShort'),
  address: z
    .string()
    .min(1, 'checkoutErrors.addressRequired')
    .min(5, 'checkoutErrors.addressTooShort'),
  city: z
    .string()
    .min(1, 'checkoutErrors.cityRequired'),
  postalCode: z
    .string()
    .min(1, 'checkoutErrors.postalCodeRequired'),
  country: z
    .string()
    .min(1, 'checkoutErrors.countryRequired'),

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
  { value: 'MK', label: 'North Macedonia', labelMk: 'Северна Македонија' },
  { value: 'AL', label: 'Albania', labelMk: 'Албанија' },
  { value: 'BG', label: 'Bulgaria', labelMk: 'Бугарија' },
  { value: 'GR', label: 'Greece', labelMk: 'Грција' },
  { value: 'RS', label: 'Serbia', labelMk: 'Србија' },
  { value: 'XK', label: 'Kosovo', labelMk: 'Косово' },
  { value: 'ME', label: 'Montenegro', labelMk: 'Црна Гора' },
  { value: 'HR', label: 'Croatia', labelMk: 'Хрватска' },
  { value: 'SI', label: 'Slovenia', labelMk: 'Словенија' },
  { value: 'AT', label: 'Austria', labelMk: 'Австрија' },
  { value: 'DE', label: 'Germany', labelMk: 'Германија' },
  { value: 'IT', label: 'Italy', labelMk: 'Италија' },
  { value: 'FR', label: 'France', labelMk: 'Франција' },
  { value: 'NL', label: 'Netherlands', labelMk: 'Холандија' },
  { value: 'BE', label: 'Belgium', labelMk: 'Белгија' },
  { value: 'CH', label: 'Switzerland', labelMk: 'Швајцарија' },
  { value: 'GB', label: 'United Kingdom', labelMk: 'Обединето Кралство' },
  { value: 'US', label: 'United States', labelMk: 'Соединети Американски Држави' },
  { value: 'CA', label: 'Canada', labelMk: 'Канада' },
  { value: 'AU', label: 'Australia', labelMk: 'Австралија' },
];
