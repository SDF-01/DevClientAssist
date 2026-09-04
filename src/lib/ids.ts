const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value.trim())
}

export function toDatabaseUuid(value: string | null | undefined): string {
  const trimmed = value?.trim() ?? ''
  if (isUuid(trimmed)) return trimmed

  const withoutPrefix = trimmed.replace(/^(rev|request|item|ref)-/i, '')
  if (isUuid(withoutPrefix)) return withoutPrefix

  return crypto.randomUUID()
}
