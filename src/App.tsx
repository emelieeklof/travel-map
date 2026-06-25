import { useEffect, useState } from 'react'
import { APIProvider } from '@vis.gl/react-google-maps'
import { KeyRound, Menu } from 'lucide-react'
import { Sidebar } from './components/Sidebar'
import { MapView } from './components/MapView'
import { PlaceSearch, type PickedPlace } from './components/PlaceSearch'
import { AddPlaceDialog } from './components/AddPlaceDialog'
import { actions, seedIfEmpty, useAppState } from './store'

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

function App() {
  useEffect(() => {
    seedIfEmpty()
  }, [])

  if (!API_KEY) {
    return <MissingApiKeyScreen />
  }

  return (
    <APIProvider apiKey={API_KEY} libraries={['places', 'marker']}>
      <Shell />
    </APIProvider>
  )
}

function Shell() {
  const activeListId = useAppState((s) => s.activeListId)
  const [picked, setPicked] = useState<PickedPlace | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  useGeolocationWatcher()

  return (
    <div className="relative flex h-full w-full overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close menu"
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
        />
      )}
      <main className="relative flex flex-1 flex-col">
        <div className="absolute inset-x-0 top-0 z-10 flex items-start gap-2 px-3 pt-3 md:justify-center md:px-4 md:pt-4">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white shadow-sm md:hidden"
          >
            <Menu className="h-5 w-5 text-zinc-700" />
          </button>
          <div className="w-full md:max-w-xl">
            <PlaceSearch onPick={setPicked} disabled={!activeListId} />
          </div>
        </div>
        <div className="flex-1">
          <MapView onAddPoi={setPicked} />
        </div>
      </main>
      <AddPlaceDialog
        picked={picked}
        onCancel={() => setPicked(null)}
        onSave={(input) => {
          if (!activeListId) return
          actions.addPlace({
            listId: activeListId,
            name: input.name,
            category: input.category,
            lat: input.lat,
            lng: input.lng,
            address: input.address,
            placeId: input.placeId,
            notes: input.notes,
          })
          setPicked(null)
        }}
      />
    </div>
  )
}

/**
 * Subscribes to the browser Geolocation API while the user has location
 * tracking enabled (via the locate button on the map). Pushes every fix into
 * the store and cleans up on unmount or when the user turns tracking off.
 */
function useGeolocationWatcher() {
  const active = useAppState((s) => s.locationWatching)
  useEffect(() => {
    if (!active) return
    if (!('geolocation' in navigator)) {
      actions.setLocationStatus('unavailable')
      return
    }
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        actions.setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        })
        actions.setLocationStatus('watching')
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          actions.setLocationStatus('denied')
        } else {
          actions.setLocationStatus('unavailable')
        }
        // Don't auto-disable on transient errors — the watcher keeps retrying.
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 },
    )
    return () => {
      navigator.geolocation.clearWatch(id)
    }
  }, [active])
}

function MissingApiKeyScreen() {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <KeyRound className="h-5 w-5" />
        </div>
        <h1 className="mt-3 text-lg font-semibold text-zinc-900">Add your Google Maps API key</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Atlas needs a Google Maps API key to render the map and power Places search.
        </p>
        <ol className="mt-4 list-decimal space-y-1.5 pl-5 text-sm text-zinc-700">
          <li>
            Create a key in the{' '}
            <a
              className="text-indigo-600 underline"
              href="https://console.cloud.google.com/google/maps-apis/credentials"
              target="_blank"
              rel="noreferrer"
            >
              Google Cloud Console
            </a>
            .
          </li>
          <li>
            Enable <strong>Maps JavaScript API</strong> and <strong>Places API</strong> for your
            project.
          </li>
          <li>
            Paste it into <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs">.env.local</code>{' '}
            as <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs">VITE_GOOGLE_MAPS_API_KEY</code>.
          </li>
          <li>Restart the dev server.</li>
        </ol>
      </div>
    </div>
  )
}

export default App
