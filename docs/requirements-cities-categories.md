# Cities + custom categories

## Context
Pins were organized only into named "collections" (e.g. "Lisbon"). This reframes the user's own collections as **cities**, with **category** as the real browsing/filtering axis inside a city — including categories the user invents themselves (e.g. "Mushroom spots").

Scoped to the signed-in user's own pins only. Explore/Home/Guides (mock creators' content) are unchanged and keep using only the 6 built-in categories.

## Behavior
- Your "Collections" tab (Profile) is now labeled "Cities". Existing collections become cities as-is — no migration.
- When adding a pin, the category chip picker includes a "+ New category" chip: type a name, hit Enter, and it's created and selected immediately. New categories get an auto-assigned icon + color and are available across all of your cities from then on.
- Opening a city shows a Map/List tab switcher:
  - **Map**: the existing full-screen map, tap a pin to open its detail as a bottom-sheet overlay.
  - **List**: pins grouped by category (icon + label + count headers), same tile grid as the Me → Pins tab.
- A category-filter chip row (built from categories actually present in that city) sits above both tabs. Multiple chips can be active at once (multi-select) — both tabs update together.
- Custom categories are create-only for now (no rename/delete UI).

## Data model
- New `custom_categories` table (`owner_id`, `label`, `color`, `icon`), RLS scoped to the owner, mirroring the existing `collections` policies.
- `Place.category` (and the `places.category` DB column, already unconstrained `text`) now holds either a built-in category id or a custom category's UUID.

## Files touched
- `supabase/schema.sql` — `custom_categories` table + RLS.
- `src/types.ts`, `src/store.ts` — `CustomCategory` type, `customCategories` state + hydration, `createCustomCategory` action.
- `src/categories.ts`, `src/customCategoryIcons.ts` — merged category lookup (`categoryById`) with a safe fallback, curated custom-category icon set.
- `src/components/AddPlaceDialog.tsx` — inline "+ New category" chip flow; "Collection" → "City" copy.
- `src/components/CityView.tsx` (replaces `CollectionMapView.tsx`) — Map/List tabs, multi-select category filter.
- `src/components/MapView.tsx` — `categoryFilter` prop for view-local filtering (independent of the existing global `hiddenCategories` toggle).
- `src/components/Profile.tsx`, `PinTile.tsx`, `SpotDetailContent.tsx`, `CategoryMarker.tsx`, `LegacyCategoryMarker.tsx` — updated to resolve categories through the merged lookup instead of the static-only map.

## What's unchanged
- Explore, Home (Following feed), Guides — still built-in-categories only, still say "Collection".
- `Collection` type/table, `collectionId`, `createCollection` — unchanged internally; only user-facing copy in the user's-own surfaces changed to "City".
