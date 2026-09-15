# SPOTTED — Requirements: Social Feed, AI Guides & Navigation Rework



## Context

The app currently centers each bottom-nav tab around the map (Home = map+sidebar, Saved = your own collections as a sidebar overlay). This redesign shifts Home and Explore toward social/discovery content, moves the map to live only inside the "Add a spot" flow and inside individual collections, replaces Saved with an AI travel-guide generator, and fixes a couple of rough edges (compare-distance placement, focus-mode zoom reset).

Several sections are explicitly scoped as **mocked data for this pass** — no backend logic, just enough hardcoded/sample content to validate the UI direction before wiring anything real.

---

## 1. Home tab → "Following" feed

**Current state:** Home shows the map + sidebar (collection switcher, category filters, pin list) — effectively a duplicate of what a collection detail view should be.

**New behavior:**
- Home becomes a reverse-chronological feed of newly added spots from creators you follow (a pin someone you follow just added to one of their collections).
- Each feed item: creator avatar/handle, the spot's photo/category, spot name + location, which collection it was added to, relative timestamp ("2h ago").
- Tapping a feed item opens that spot's detail screen (existing `SpotDetail`).
- **Empty state** (following 0 creators): no feed, instead a prompt encouraging the user to follow creators, with a CTA button that jumps to Explore.
- **Scope:** mocked data only — a hardcoded list of "recent activity" items attached to the existing mock creators (@sarah, @erik, @maria, etc.) is sufficient. No real activity feed / real-time backend needed yet.

**Open question:** Should feed items include your *own* newly added spots too, or only followed creators' activity? **Answer:**  followed creators only, since your own additions are already visible in Me/Saved.

---

## 2. Explore tab → Personalized suggestions

**Current state:** Explore is a flat masonry grid of every collection (yours + all mock creators), with a search box, sorted with no particular logic.

**New behavior:**
- Explore becomes a "for you" surface: collections/spots suggested based on (a) creators you follow and (b) categories your own pins skew toward (e.g. if most of your pins are `eating`, surface more food-focused collections).
- Likely sectioned, e.g. "More from creators you follow," "Because you save a lot of restaurants," "Trending this week" — exact section set is a design decision, not fixed by this doc.
- Search still available, filtering across all suggested + all collections (not just the personalized subset).
- **Scope:** mocked — a simple hardcoded ranking/grouping of the existing mock collections is enough; no real recommendation logic.

**Open question:** Keep today's flat "all collections" grid reachable somehow (e.g. a "Browse all" link), or fully replace it with the personalized view? **Answer:** fully replace it with the personalized view

---

## 3. Add (+) flow → Map-first, no side drawer

**Current state:** Tapping "+" opens the `Sidebar` as a full-width drawer overlaying the map (collection switcher + category filters + pin list) — not built for a small screen, and conceptually mixes "browse my collection" with "add a new pin."

**New behavior:**
- Tapping "+" opens a **dedicated add-spot screen**: full-screen map + the existing `PlaceSearch` bar on top. No side drawer.
- Tapping a place (search result or map POI) opens the existing `AddPlaceDialog` (name, category, notes, Instagram), **plus a new Collection picker**: choose an existing collection from a list, or create a new one inline — since there's no more persistent "active collection" set via a sidebar, the dialog itself must ask.
- Saving adds the pin to the chosen/new collection and returns to wherever "+" was triggered from (or to that collection's detail view — implementer's call).
- **Scope:** this one should be fully functional, not mocked — it's the core "add a pin" flow and already has working pieces (`MapView`, `PlaceSearch`, `AddPlaceDialog`) that just need re-wiring, not new backend logic.

**Open question:** After saving, land back on the previous tab, or jump into the collection you just added to? **Answer:** land back on the previous tab

---

## 4. "Compare walking distance" → move into a collection's map view

**Current state:** Lives in the `Sidebar`'s `CompareBar`, tucked into the same drawer being removed in #3 — so it needs a new home regardless.

**Your stated intent:** Use it *within one collection* — comparing two pins that both belong to the same collection.

**Proposed new placement:** Move it into a **collection detail screen's map view**. Concretely: opening a collection (tapping a `CollectionCard`, or "view on map" from a collection's pin list) shows that collection's pins on a map — this becomes the map's new home now that Home itself no longer shows it. A small "Compare distance" toggle/button sits on that map's toolbar (same spot the old `FocusModeToggle`/`LocationControl` live today), scoped to that collection's own pins only.

**Behavior once entered:**
- Tap two pins within that collection's map to select them (existing `compareSelection` logic already supports this).
- Walking route + distance/duration panel renders exactly as it does today (`WalkingRoutePanel`, `useWalkingRoute` — unchanged).
- Exiting compare mode returns to normal single-pin selection on that same map.

**Open question:** Does every collection (yours and others') get this "view on map" entry point, or only your own? **Answer:** every collection gets it

---

## 5. Saved tab → "Guides" (AI travel-guide generator)

**Current state:** Saved shows your own collections as a forced-open sidebar (same drawer as Home).

**New behavior:**
- Replace the Saved tab with a chat-style **Guides** tab (naming open — "Guides" read better than "Chat" for what it does, but flag for your call).
- User describes a trip ("I'm visiting Athens for 4 days") and gets back a generated set of collections split by theme — e.g. "Sightseeing," "Restaurants," "Cafés" — each pre-populated with a handful of named spots.
- Generated collections should slot into the existing data model (they're just `Collection` + `Place` rows) so they show up in Explore/Me like any other collection once "accepted"/saved.
- **Scope:** mocked — hardcode the Athens example end-to-end (canned response, canned collections/spots) rather than calling a real LLM. The point of this pass is validating the UX (chat input → generated guide cards → save), not the generation itself.

**Open questions:**
- Confirm tab name ("Guides" vs "Chat" vs other). **Answer:** Use Guides
- Should a generated guide be saved automatically, or does the user review/edit before it's added to their collections? **Answer:** They can review and edit before its saved.

---

## 6. Me tab → Pins grouped by category

**Current state:** The Pins sub-tab (`Profile.tsx`) shows all of your pins in one flat grid, in whatever order they come back from the store.

**New behavior:** Group that same grid by category (Eating, Sightseeing, Shopping, Bars, Activities, Other — the existing `CATEGORIES` list), with a section header per category (reusing the label/color/icon styling already used elsewhere, e.g. `Sidebar`'s category chips). Empty categories are simply omitted.

**Scope:** fully functional — this is a pure client-side grouping/sort of data that already exists (`places` + `category`), no backend change needed.

---

## 7. Bug: Focus mode resets zoom/pan

**Current behavior:** Toggling "All places" / focus mode snaps the map back out to a wider view, even if you had manually zoomed in.

**Root cause (confirmed in code):** `MapView.tsx` sets `mapId={focusMode ? undefined : MAP_ID}` — toggling `focusMode` changes the `mapId` prop, and Google Maps JS API only accepts `mapId` at map construction time. Changing it forces the underlying map instance to be destroyed and recreated, which falls back to `defaultCenter`/`defaultZoom` and loses whatever pan/zoom the user had.

**Required fix:** Preserve the user's current center/zoom across a focus-mode toggle — capture `map.getCenter()`/`map.getZoom()` right before the toggle-triggered remount and re-apply them once the new map instance mounts, instead of relying on `defaultCenter`/`defaultZoom`.

**Scope:** fully functional bug fix, no mocking involved.

---

## Summary: mocked vs. real for this pass

| # | Feature | Scope |
|---|---|---|
| 1 | Home → Following feed | Mocked data |
| 2 | Explore → Suggestions | Mocked data |
| 3 | Add flow rework + collection picker | **Real** (rewires existing working pieces) |
| 4 | Compare distance relocation | **Real** (existing logic, new placement) |
| 5 | Saved → Guides (AI) | Mocked (hardcoded Athens example) |
| 6 | Me → Pins by category | **Real** |
| 7 | Focus-mode zoom bug | **Real** (bug fix) |

