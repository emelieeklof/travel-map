# SPOTTED — Regression testing plan

Status: **Draft for review** — nothing implemented yet.

## Context
SPOTTED currently has zero automated tests, and every push to `main` auto-deploys straight to production via Vercel's GitHub integration — there's no safety net at all. We just shipped a real example of the risk: `AddPlaceDialog`'s store selector returned a new array every render, causing an infinite loop that blanked the whole Add screen, and it only surfaced because you happened to click the button after deploy. Per your answer, this pass covers the **critical flows** (not full end-to-end coverage), and **blocks deploys** on failing tests rather than just being available to run manually.

## Test stack
**Vitest + React Testing Library**, not a browser end-to-end tool (Playwright/Cypress) — deliberately. Full E2E would need to either hit real Google Maps + Supabase in CI (slow, flaky, needs secrets committed to GitHub) or build out a whole mocking layer for both — disproportionate for "critical flows" scope. Vitest integrates natively with the existing Vite config, runs fast, and works by mocking two things the app already isolates behind single modules:
- `src/lib/supabase.ts` — mocked so `store.ts`'s DB calls become no-ops returning canned data, no real network/DB needed.
- `@vis.gl/react-google-maps` / the `google.maps` global — mocked where a test needs to render something that touches the map, or avoided by testing the surrounding logic instead of mounting `MapView` itself.

New dev dependencies: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`. New `package.json` scripts: `"test": "vitest run"`, `"test:watch": "vitest"`.

## Critical flows covered (per your scope answer)
1. **Auth gate** (`App.tsx`) — renders `SignIn` when `authStatus === 'signedOut'`, a loading state when `'loading'`, `Shell` when `'signedIn'`. Tested by driving `useAppState`'s mocked state directly, not a real Supabase round trip.
2. **Add-a-spot + collection picker** (`AddPlaceDialog.tsx`) — picking an existing collection vs. typing a new one calls `actions.addPlace`/`actions.createCollection` with the right arguments; Save stays disabled until a name + collection choice both exist. This is also where we add a **direct regression test for the exact bug just shipped**: render the dialog and assert it doesn't throw / doesn't blow past a sane render-count — guarding against another unstable-selector-in-`useAppState` regression specifically.
3. **Follow/unfollow** (`FollowButton.tsx`) — toggling calls `actions.followCreator`/`unfollowCreator` and the button's label/state reflects `followedCreatorIds` from the store.
4. **Category-grouped pins** (`Profile.tsx`) — given a sample set of places across categories, the Pins tab groups them correctly and omits empty categories.
5. **Focus-mode zoom preservation** (`MapView.tsx`) — the viewport-restore logic added for the zoom-reset bug fix. Where practical, extract the pure "prefer last known viewport over the collection default" logic into a small standalone function so it's testable without a real Google Maps instance; the remount-guard (`lastFlownCollectionIdRef`) gets a lighter test with a minimal mocked `google.maps` global.

Not covered this pass (documented as deliberately deferred, not forgotten): Explore's suggestion sectioning, Guides' chat/save flow, SpotDetail, CollectionMapView's compare-distance UI. Fine to add next once this baseline is in and useful.

## CI wiring
New `.github/workflows/ci.yml`: on every push and PR, run `npm ci`, `npm run build`, `npm run lint`, `npm run test`.

**Important constraint on "block deploys":** Vercel's Hobby plan (what this project is on) doesn't support its native "require checks before deployment" gate — that's a Pro-plan feature. The reliable way to actually block a broken deploy on Hobby is a **process change, not just a CI file**: stop pushing directly to `main` (which is what this session has been doing throughout) and instead push to a feature branch, open a PR, and require the GitHub Actions check to pass before merging (a branch protection rule on `main` in the GitHub repo settings). Vercel still deploys **Preview** builds for branches/PRs automatically (harmless — those aren't production), and **Production** only ever builds from `main`, so gating the merge is what actually gates production.
This means going forward, shipping a change looks like: branch → commit → push → PR → CI passes → merge → auto-deploy, instead of committing straight to `main`.

## Files
- New: `vitest.config.ts` (or a `test` block in `vite.config.ts`), `src/test/setup.ts` (jest-dom matchers), `.github/workflows/ci.yml`
- New test files: `src/components/AddPlaceDialog.test.tsx`, `src/components/FollowButton.test.tsx`, `src/components/Profile.test.tsx`, `src/App.test.tsx`, plus a small extracted-logic test for the focus-mode viewport fix (exact filename depends on whether that logic gets pulled out of `MapView.tsx` into its own module)
- Edited: `package.json` (scripts + devDependencies)

## Verification
- `npm run test` runs locally and passes.
- Deliberately reintroduce the exact `AddPlaceDialog` bug (inline `.filter()` in a `useAppState` selector) locally and confirm the new regression test catches it before you'd have to find out by clicking the button in production again.
- Push a branch with a failing test, open a PR, confirm the GitHub Actions check fails and merging is blocked (once branch protection is set up) — then fix it and confirm it goes green.
