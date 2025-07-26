import { AbstractControl, ValidationErrors } from '@angular/forms';

/**
 * Validates that the password meets all required complexity rules:
 * - Length between 8 and 18 characters
 * - Contains at least one lowercase letter
 * - Contains at least one uppercase letter
 * - Contains at least one numeric digit
 * - Contains at least one special character
 *
 * Returns specific validation errors if conditions are not met.
 */
export function strongPasswordValidator(
  control: AbstractControl
): ValidationErrors | null {
  const value: string = control.value ?? '';
  const errors: ValidationErrors = {};

  if (value.length < 8) errors['passTooShort'] = true;
  if (value.length > 18) errors['passTooLong'] = true;
  if (!/[a-z]/.test(value)) errors['missingLowercase'] = true;
  if (!/[A-Z]/.test(value)) errors['missingUppercase'] = true;
  if (!/\d/.test(value)) errors['missingNumber'] = true;
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(value))
    errors['missingSpecialChar'] = true;

  return Object.keys(errors).length > 0 ? errors : null;
}

/**
 * Validates whether the control's value matches a given password string.
 *
 * Commonly used for confirm password fields.
 *
 * @param control - The form control containing the confirm password string.
 * @param newPassword - The original password string to match against.
 * @returns An object with the key 'passwordMismatch' if values do not match, otherwise null.
 */
export function matchPasswordValidator(
  control: AbstractControl,
  newPassword: string
): { [key: string]: boolean } | null {
  return control.value === newPassword ? null : { passMismatch: true };
}

/**
 * Validates whether the control's value contains at least a specified number of words.
 *
 * Useful for validating free-text fields like descriptions or titles.
 *
 * @param control - The form control containing the string to validate.
 * @param minWords - The minimum number of words required.
 * @returns An object with the key 'minWords' if the word count is insufficient, otherwise null.
 */
export function minWordCountValidator(
  control: AbstractControl,
  minWords: number
): { [key: string]: boolean } | null {
  const wordCount = (control.value ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return wordCount >= minWords ? null : { minWords: true };
}

/**
 * Normalizes a URL string by ensuring it starts with "https://"
 * if no protocol is provided. Returns `undefined` if the input is empty.
 *
 * This is useful when the backend requires absolute URLs with protocols,
 * but users may input domain names without "http://" or "https://".
 *
 * Examples:
 * - "example.com"       => "https://example.com"
 * - "http://example.com" => "http://example.com"
 * - "   " or null       => undefined
 *
 * @param input - The raw URL string input from the user (optional).
 * @returns A normalized absolute URL string or `undefined` if input is empty.
 */
export function normalizeUrl(input?: string): string | undefined {
  if (!input || input.trim() === '') return undefined;

  const trimmed = input.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

/**
 * Validates whether the control's value is a valid email address.
 *
 * Uses a stricter regex than Angular's built-in Validators.email.
 *
 * @param control - The form control containing the email string.
 * @returns An object with the key 'email' if invalid, otherwise null.
 */
export function customEmailValidator(
  control: AbstractControl
): ValidationErrors | null {
  const value: string = control.value ?? '';
  // RFC 5322 Official Standard (simplified)
  const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!value) return null;
  return EMAIL_REGEX.test(value) ? null : { email: true };
}

export function noOnlySpacesValidator(
  control: AbstractControl
): ValidationErrors | null {
  const value = control.value;
  if (
    typeof value === 'string' &&
    value.trim().length === 0 &&
    value.length > 0
  ) {
    return { onlySpaces: true };
  }
  return null;
}
