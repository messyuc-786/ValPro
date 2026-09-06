/**
 * Username rules, kept as pure functions so they're testable without a
 * Supabase project and so the exact same rule the database enforces
 * (`username_format` check + the case-insensitive unique index in
 * supabase/migrations/0001_init.sql) is checked client-side first — a
 * rejected username should read as an immediate, friendly validation
 * message, not a round trip to a database error.
 */

const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/

/** The canonical form used for both display-comparison and what's actually
 * written to the database — "Alice" and "alice" are the same identity. */
export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase()
}

export type UsernameValidationError = 'too_short' | 'too_long' | 'invalid_characters' | 'empty'

export function validateUsername(raw: string): { valid: true } | { valid: false; error: UsernameValidationError; message: string } {
  const normalized = normalizeUsername(raw)

  if (normalized.length === 0) {
    return { valid: false, error: 'empty', message: 'Choose a username.' }
  }
  if (normalized.length < 3) {
    return { valid: false, error: 'too_short', message: 'Username must be at least 3 characters.' }
  }
  if (normalized.length > 20) {
    return { valid: false, error: 'too_long', message: 'Username must be 20 characters or fewer.' }
  }
  if (!USERNAME_PATTERN.test(normalized)) {
    return { valid: false, error: 'invalid_characters', message: 'Use only lowercase letters, numbers, and underscores.' }
  }
  return { valid: true }
}
