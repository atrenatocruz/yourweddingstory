import { describe, it, expect } from 'vitest'
import { isRequired, isValidUrl } from './validation'

describe('isRequired', () => {
  it('returns false for empty or whitespace-only strings', () => {
    expect(isRequired('')).toBe(false)
    expect(isRequired('   ')).toBe(false)
  })

  it('returns true for non-empty strings', () => {
    expect(isRequired('hello')).toBe(true)
  })
})

describe('isValidUrl', () => {
  it('accepts http and https URLs', () => {
    expect(isValidUrl('https://example.com')).toBe(true)
    expect(isValidUrl('http://example.com')).toBe(true)
  })

  it('accepts well-formed mailto links', () => {
    expect(isValidUrl('mailto:someone@example.com')).toBe(true)
  })

  it('rejects malformed mailto links', () => {
    expect(isValidUrl('mailto:not-an-email')).toBe(false)
  })

  it('rejects garbage strings', () => {
    expect(isValidUrl('not a url')).toBe(false)
  })
})
