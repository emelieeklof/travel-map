# "Create another" — add multiple pins without leaving the dialog

## Context
Adding a pin today means: search or tap a POI on the map → the save dialog opens prefilled with that place → save → the dialog and the whole Add-spot screen close. Adding several pins in a row means repeating that full round-trip each time. You want to stay in the save dialog and add pin after pin without leaving it.

## Behavior
1. The save dialog (`AddPlaceDialog`) gets a **"Create another"** checkbox.
2. **Name field becomes a live Google Places search**, every time (not just for repeat adds) — the same autocomplete used on the map's top search bar (`PlaceSearch`), instead of a plain text box. Picking a result fills in the same fields as today (address, photo, phone, hours, price, maps link, etc.).
3. When you save with "Create another" checked:
   - The pin is created immediately, same as today.
   - The dialog stays open instead of closing.
   - **City carries over** from the pin you just saved.
   - **Category does not carry over** — it resets to the guessed/default category for whatever you search next, same as a fresh add.
   - Name/notes/Instagram clear, ready for the next search.
   - A running count of pins created in this streak increments.
4. When you save with "Create another" **unchecked** (or you close the dialog after having created some via the checkbox):
   - If **2 or more** pins were created in this streak: show a success message — "Successfully created N pins" — with a small celebratory animation/icon (e.g. a checkmark or pin icon that pops in, brief confetti-style flourish, auto-dismiss after ~2s), then close the Add-spot screen as today.
   - If only 1 pin was created (checkbox never used, or used once and then unchecked before a 2nd save): behaves exactly as today — no message, dialog just closes.

## Implementation notes
- `AddPlaceDialog` currently receives its `picked: PickedPlace` from the parent (`AddSpotScreen`, via the map's tap-a-POI or the top `PlaceSearch` bar) — it has no internal notion of "search for the next place." To support staying open across saves, the dialog needs to own its own place-search state for anything after the first pin (embedding `PlaceSearch` itself, reusing its existing `onPick` API), rather than solely relying on the parent's `picked` prop.
- Track a simple in-dialog counter (`sessionCount`), reset whenever the dialog fully closes (new `picked` from the parent, or the Add-spot screen itself closes).
- The success message is a new small toast/overlay component — no existing component to reuse; keep it simple (icon + text + fade/scale-in), matching the app's existing motion style (see the splash screen's animation keyframes in `src/index.css` for the established easing/feel).

## Files touched
- `src/components/AddPlaceDialog.tsx` — checkbox, embedded search, carry-over city / reset category, session counter, triggers the success message.
- New `src/components/PinsCreatedToast.tsx` (or similar) — the success animation/message.
- `src/components/AddSpotScreen.tsx` — minor: only closes the whole screen once the dialog reports it's actually done (not on every save when "Create another" is checked).

## Verification
- Add a pin without touching the checkbox — behaves exactly as today, no message.
- Check "Create another", save — dialog stays open, name field is a fresh search box, city pre-selected to the one just used, category back to default/guessed.
- Add 3 pins this way, then uncheck and save a 4th (or close) — see "Successfully created 4 pins" with the animation, then the screen closes.
- Add 1 pin with the box checked, then uncheck before the next save — closing after that shows no message (only 1 pin total).
