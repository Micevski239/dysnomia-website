/**
 * Pick the Macedonian field value when the current language is 'mk',
 * falling back to the default (English) value.
 */
export function localize(
  defaultValue: string | null | undefined,
  mkValue: string | null | undefined,
  language: string
): string {
  if (language === 'mk' && mkValue) return mkValue;
  return defaultValue || '';
}
