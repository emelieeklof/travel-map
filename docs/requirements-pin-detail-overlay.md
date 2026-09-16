# Collection map view: tap a pin → open full detail directly



## Context
The collection map view (`CollectionMapView.tsx`) currently shows a full-screen map; tapping a pin marker shows a small floating card (`PinTile` — just a photo + name) at the bottom, and you have to tap *that* card again to reach the full detail screen. You want to skip that intermediate step: tapping a pin should go straight to the full detail overlay.

## Current state
- Map fills the screen (`MapView`, full-bleed).
- Tapping a marker calls `actions.selectPlace(id)`, which shows a small `PinTile` card (photo + name only) floating at the bottom.
- Tapping that small card calls `actions.openDetail({ type: 'spot', id })`, which swaps the whole screen for `SpotDetail.tsx` — the rich card shown in your screenshot (photo, name, address + price level, "View on Google Maps" link, Save/Direction/Instagram/Share pills, expandable opening hours, your notes, "Curated by").

## New behavior
- Tapping a pin marker on the collection map calls `actions.openDetail({ type: 'spot', id })` **directly** — the small intermediate `PinTile` card is removed from this flow entirely.
- The detail screen itself is **already built and already matches your screenshot exactly** — same rounded-corner card floating over the photo, same expandable "Opening hours" section, same layout. No new UI work needed there; this is purely about *when* it appears (immediately on tap, not after a second tap on a small card).
- Closing the detail (back chevron, top-left) returns you to the full-screen map, same as it does today.
- The small `PinTile` popup card is removed from `CollectionMapView` — it no longer serves a purpose once tapping a pin goes straight to full detail. (`PinTile` itself stays — it's still used by the Me → Pins tab grid.)

## What's explicitly *not* changing
- `SpotDetail.tsx`'s content/layout — photo, name, address, price level, Google Maps link, action pills, expandable hours, notes, "Curated by" — is already exactly what's in your screenshot. This doc doesn't ask for any content changes there.
- The Me → Pins tab and its `PinTile` grid — untouched, still tap-to-open-detail as today.

## Files touched
- `src/components/CollectionMapView.tsx` — marker tap handler changes from select-then-show-card to open-detail-directly; the floating `PinTile` card block is removed.
- No changes expected to `SpotDetail.tsx`, `MapView.tsx`, `PinTile.tsx`, or the data model.

## Verification
- Open a collection, tap a pin marker — the full detail overlay (photo, name, address/price, action pills, expandable hours, notes, curated-by) opens immediately, no intermediate small card.
- Tap the back chevron — returns to the full-screen map.
- Me → Pins tab still works exactly as before (unaffected).
