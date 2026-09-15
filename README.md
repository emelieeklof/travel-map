# SPOTTED — curated maps & creators

A travel-map app that fixes the thing Google Maps gets wrong: when you save a bunch
of places to a list, you can't tell what's what. SPOTTED lets you tag every saved
place with a **category** (eating, sightseeing, shopping, bars, activities), follow
other creators, and browse their curated collections — Instagram/Pinterest-style,
but for places.

This is the web prototype. The architecture is deliberately portable — React +
TypeScript + a small store — so the same logic can move to React Native (or
Capacitor) when you're ready for iOS/Android.

## Setup

```bash
npm install
cp .env.example .env.local
# paste your Google Maps API key into .env.local
npm run dev
```

### Getting a Google Maps API key

1. Create a project in the [Google Cloud Console](https://console.cloud.google.com/).
2. Enable **Maps JavaScript API** and **Places API**.
3. Create an API key under **APIs & Services → Credentials**.
4. (Optional, recommended) restrict the key to your local origin while developing.

Drop the key into `.env.local`:

```
VITE_GOOGLE_MAPS_API_KEY=your-key-here
VITE_GOOGLE_MAPS_MAP_ID=DEMO_MAP_ID
```

`DEMO_MAP_ID` is Google's public demo Map ID — fine for the prototype. When you
want a custom map style, create your own in **Maps Studio** and swap the ID.

### Setting up the backend (Supabase)

1. Create a free project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run `supabase/schema.sql` (tables + row-level security).
3. In **Authentication → Providers**, enable **Google** — use an OAuth client
   from the same Google Cloud project as your Maps key, and add the
   Supabase-provided redirect URL to that OAuth client's allowed redirect URIs.
4. In **Project Settings → API**, copy the Project URL and anon public key into
   `.env.local`:

```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Sign in with Google on first load — you'll land on a starter "Lisbon"
collection seeded into your own account.

## How it works

- **Lists** are destinations ("Lisbon", "Tokyo", "Roadtrip Italy"). Switch
  between them from the sidebar.
- **Places** belong to a list and have a category. Search via the top bar, pick
  a category in the dialog, save.
- **Category chips** in the sidebar toggle which pins are visible on the map.
  Click "Eating" alone and the map shows only restaurants.
- Signed in with Google, your collections/places are stored in Supabase
  (Postgres) tied to your account — durable across devices/browsers.
  `@sarah`/`@alex`/`@lucas`/`@james` are hardcoded demo creators for the
  Explore feed, not real accounts.

## Project layout

```
src/
  App.tsx               root layout + auth gate + APIProvider + dialog state
  store.ts              state store (useSyncExternalStore) + Supabase reads/writes
  lib/supabase.ts        Supabase client
  mockCreators.ts        hardcoded demo creators/collections/places + starter seed
  types.ts               Creator, Collection, Place
  categories.ts          category metadata (label, color, icon)
  components/
    SignIn.tsx            Google sign-in screen
    MapView.tsx           Google Map, markers, info window, fly-to behavior
    CategoryMarker.tsx    custom HTML pin per category
    Sidebar.tsx           collection switcher, category filters, place list
    PlaceSearch.tsx        Google Places autocomplete input
    AddPlaceDialog.tsx     modal to pick category + notes before saving
    Explore.tsx, Profile.tsx, SpotDetail.tsx, BottomNav.tsx  social/nav screens
supabase/schema.sql      table definitions + row-level security policies
```

## Roadmap

- **Real multi-user social** — today only your own data is real; following/
  collections could become a genuine multi-user feature once more people use it.
- **Mobile** — port to React Native (iOS/Android). The store, types, and
  category logic are already platform-agnostic; only the map and search
  components need native equivalents (`react-native-maps`, native Places SDK).
- **Custom map style** — create a Maps Studio map ID for branded styling.
- **Offline** — local queue for writes made while offline.
- **Reverse geocoding** — drop a pin anywhere on the map by clicking it.
- **Photos & ratings** — pull from Google Places Details API.
- **Import/export** — bring in Google Maps starred places.

## Why these tech choices

- **Vite + React + TS** — fastest path to a polished web prototype; React
  components and TS types port cleanly to React Native later.
- **`@vis.gl/react-google-maps`** — official Google-backed React bindings;
  cleaner than `@react-google-maps/api` and supports Advanced Markers.
- **Tailwind v4** — fast polish, no separate CSS files, design tokens in one
  place.
- **`useSyncExternalStore` + Supabase** — same lightweight store as before,
  now backed by Postgres instead of `localStorage` — real accounts, real
  persistence, no separate backend to run.
