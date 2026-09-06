import { describe, expect, it } from 'vitest'
import { normalizeUsername, validateUsername } from './username'

describe('normalizeUsername', () => {
  it('lowercases and trims', () => {
    expect(normalizeUsername('  Alice  ')).toBe('alice')
  })
})

describe('validateUsername', () => {
  it('rejects empty', () => {
    const result = validateUsername('')
    expect(result.valid).toBe(false)
    if (!result.valid) expect(result.error).toBe('empty')
  })

  it('rejects under 3 characters', () => {
    const result = validateUsername('ab')
    expect(result.valid).toBe(false)
    if (!result.valid) expect(result.error).toBe('too_short')
  })

  it('rejects over 20 characters', () => {
    const result = validateUsername('a'.repeat(21))
    expect(result.valid).toBe(false)
    if (!result.valid) expect(result.error).toBe('too_long')
  })

  it('rejects unsafe/invalid characters (spaces, symbols, unicode)', () => {
    for (const bad of ['bad name', 'bad@name', 'bad.name', 'bad/name', 'namé']) {
      const result = validateUsername(bad)
      expect(result.valid, `expected "${bad}" to be invalid`).toBe(false)
      if (!result.valid) expect(result.error).toBe('invalid_characters')
    }
  })

  it('accepts lowercase letters, digits, and underscores at valid lengths', () => {
    for (const good of ['abc', 'valid_user_123', 'a'.repeat(20)]) {
      expect(validateUsername(good)).toEqual({ valid: true })
    }
  })

  it('is comparison-normalized — "Alice" and "alice" validate identically', () => {
    expect(validateUsername('Alice')).toEqual(validateUsername('alice'))
  })
})
