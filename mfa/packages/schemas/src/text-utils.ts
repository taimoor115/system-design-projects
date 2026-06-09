const HTML_TAG_REGEX = /<\/?[a-z][\w:-]*(?:\s+[^<>]*)?>/gi
const CONTROL_CHAR_REGEX = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g

export function sanitizePlainText(value: string): string {
  return value
    .replace(HTML_TAG_REGEX, ' ')
    .replace(CONTROL_CHAR_REGEX, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function sanitizeRequiredText(value: unknown): string {
  if (typeof value !== 'string') {
    return ''
  }

  return sanitizePlainText(value)
}

export function sanitizeOptionalText(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined
  }

  const sanitized = sanitizePlainText(value)
  return sanitized.length > 0 ? sanitized : undefined
}