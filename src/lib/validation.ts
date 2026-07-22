export function isRequired(value: string): boolean {
  return value.trim().length > 0
}

export function isValidUrl(value: string): boolean {
  if (value.startsWith('mailto:')) {
    return /^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  }
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}
