# Category color accent on pin cards

## Context
Each category (built-in and custom) already has its own color, used for map pins. That color currently isn't visible on pin cards in list-style views — you want the category to be visually obvious at a glance without opening the pin, especially useful in a city's List tab where pins from several categories are mixed together.

## Behavior
- Every pin card (`PinTile`) gets a colored vertical accent bar down its left edge, using that pin's category color (built-in or custom).
- Applies everywhere `PinTile` is used: a city's List tab and the Me → Pins tab grid — one consistent look, no special-casing per screen.
- No change to map markers, the spot detail overlay, or category chip styling — those already show the category color.

## Implementation notes
- `PinTile.tsx` already resolves the pin's category via `categoryById(place.category, customCategories)` (added in the cities/custom-categories work) — reuse that color, no new data needed.
- Add a left border (e.g. `border-l-4`) with an inline `style={{ borderColor: cat.color }}` (Tailwind can't do arbitrary per-pin colors via class names alone), applied to the card's outer element.

## Files touched
- `src/components/PinTile.tsx`

## Verification
- `npm run build`, `npm run lint`, `npm run test` clean.
- Open a city's List tab with pins from 2+ categories — confirm each card shows its category's color as a left-edge bar.
- Check Me → Pins tab — same accent bar appears there too.
- Create a pin with a custom category — confirm its card shows the custom category's auto-assigned color.
