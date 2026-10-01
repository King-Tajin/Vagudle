const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@.]{2,}$/;

export const isValidEmail = (value: string): boolean =>
  EMAIL_PATTERN.test(value.trim());
