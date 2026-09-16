/** Normalizes Google's two different price-level shapes — the legacy Autocomplete
 * API returns a number 0-4, the new Places API returns a string enum — into the
 * same 0-4 scale our `Place.priceLevel` uses everywhere. */
export function normalizePriceLevel(value: number | string | null | undefined): number | undefined {
  if (value == null) return undefined
  if (typeof value === 'number') return value
  switch (value) {
    case 'PRICE_LEVEL_FREE':
      return 0
    case 'PRICE_LEVEL_INEXPENSIVE':
      return 1
    case 'PRICE_LEVEL_MODERATE':
      return 2
    case 'PRICE_LEVEL_EXPENSIVE':
      return 3
    case 'PRICE_LEVEL_VERY_EXPENSIVE':
      return 4
    default:
      return undefined
  }
}

export function priceLevelToDollarSigns(level: number | undefined): string | undefined {
  if (level == null) return undefined
  return '$'.repeat(Math.max(1, level))
}
