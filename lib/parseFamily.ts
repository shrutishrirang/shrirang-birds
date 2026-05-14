/**
 * Parses a Sanity family string like "Anatidae (Ducks, Geese, and Waterfowl)"
 * into its code and common name parts.
 */
export function parseFamily(family: string): { code: string; common: string } {
  const m = family?.match(/^(\w+)\s*\((.+)\)$/)
  return m ? { code: m[1], common: m[2] } : { code: family ?? '', common: '' }
}

/** Returns just the family code, e.g. "Anatidae". */
export function parseFamilyCode(family: string): string {
  return parseFamily(family).code
}
