# Atlas — travel map prototype

A travel-map app that fixes the thing Google Maps gets wrong: when you save a bunch
of places to a list, you can't tell what's what. Atlas lets you tag every saved
place with a **category** (eating, sightseeing, shopping, bars, activities) and
filter the map by them.

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

## How it works

- **Lists** are destinations ("Lisbon", "Tokyo", "Roadtrip Italy"). Switch
  between them from the sidebar.
- **Places** belong to a list and have a category. Search via the top bar, pick
  a category in the dialog, save.
- **Category chips** in the sidebar toggle which pins are visible on the map.
  Click "Eating" alone and the map shows only restaurants.
- Everything is persisted to `localStorage` for now.

## Project layout

```
src/
  App.tsx               root layout + APIProvider + dialog state
  store.ts              tiny state store (useSyncExternalStore + localStorage)
  types.ts              List, Place
  categories.ts         category metadata (label, color, icon)
  components/
    MapView.tsx         Google Map, markers, info window, fly-to behavior
    CategoryMarker.tsx  custom HTML pin per category
    Sidebar.tsx         list switcher, category filters, place list
    PlaceSearch.tsx     Google Places autocomplete input
    AddPlaceDialog.tsx  modal to pick category + notes before saving
```

## Roadmap

- **Curated shareable lists** — public URL per list, read-only view for friends.
- **Social** — follow other travelers, save their lists into yours, comment.
- **Mobile** — port to React Native (iOS/Android). The store, types, and
  category logic are already platform-agnostic; only the map and search
  components need native equivalents (`react-native-maps`, native Places SDK).
- **Custom map style** — create a Maps Studio map ID for branded styling.
- **Offline** — IndexedDB + tile caching for offline use abroad.
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
- **`useSyncExternalStore` + localStorage** — zero-dep store. Swap for Zustand
  or move to a backend (Supabase/Postgres) when sharing lists requires it.
