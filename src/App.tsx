import { useEffect, useState } from 'react'
import { APIProvider } from '@vis.gl/react-google-maps'
import { KeyRound } from 'lucide-react'
import { BottomNav } from './components/BottomNav'
import { FollowingFeed } from './components/FollowingFeed'
import { Explore } from './components/Explore'
import { Guides } from './components/Guides'
import { Profile } from './components/Profile'
import { SpotDetail } from './components/SpotDetail'
import { CollectionMapView } from './components/CollectionMapView'
import { AddSpotScreen } from './components/AddSpotScreen'
import { Logo } from './components/Logo'
import { SignIn } from './components/SignIn'
import { actions, hydrate, markSignedOut, useAppState } from './store'
import { supabase, supabaseConfigured } from './lib/supabase'

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

function App() {
  const authStatus = useAppState((s) => s.authStatus)

  useEffect(() => {
    if (!supabaseConfigured) {
      markSignedOut()
      return
    }
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) hydrate(data.session.user)
      else markSignedOut()
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) hydrate(session.user)
      else markSignedOut()
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  if (!API_KEY) {
    return <MissingApiKeyScreen />
  }

  if (authStatus === 'loading') {
    return <div className="flex h-full w-full items-center justify-center bg-surface" />
  }

  if (authStatus === 'signedOut') {
    return <SignIn />
  }

  return (
    <APIProvider apiKey={API_KEY} libraries={['places', 'marker']}>
      <Shell />
    </APIProvider>
  )
}

function Shell() {
  const tab = useAppState((s) => s.tab)
  const detail = useAppState((s) => s.detail)
  const [addSpotOpen, setAddSpotOpen] = useState(false)
  useGeolocationWatcher()

  return (
    <div className="relative mx-auto flex h-full w-full max-w-[480px] flex-col overflow-hidden bg-surface md:my-0 md:h-screen md:shadow-float">
      <div className="relative flex-1 overflow-hidden">
        {addSpotOpen ? (
          <AddSpotScreen onClose={() => setAddSpotOpen(false)} />
        ) : detail?.type === 'spot' ? (
          <SpotDetail placeId={detail.id} />
        ) : detail?.type === 'creator' ? (
          <Profile creatorId={detail.id} />
        ) : detail?.type === 'collection' ? (
          <CollectionMapView collectionId={detail.id} />
        ) : tab === 'home' ? (
          <FollowingFeed />
        ) : tab === 'explore' ? (
          <Explore />
        ) : tab === 'guides' ? (
          <Guides />
        ) : (
          <Profile />
        )}
      </div>
      {!addSpotOpen && <BottomNav onAdd={() => setAddSpotOpen(true)} />}
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
    <div className="flex h-full items-center justify-center p-6 bg-surface">
      <div className="max-w-md rounded-md border border-outline-variant bg-surface-container-lowest p-6 shadow-card">
        <div className="flex items-center gap-2">
          <Logo size={28} />
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container/20 text-primary">
            <KeyRound className="h-5 w-5" />
          </div>
        </div>
        <h1 className="mt-3 text-lg font-semibold text-on-surface">Add your Google Maps API key</h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          SPOTTED needs a Google Maps API key to render the map and power Places search.
        </p>
        <ol className="mt-4 list-decimal space-y-1.5 pl-5 text-sm text-on-surface-variant">
          <li>
            Create a key in the{' '}
            <a
              className="text-primary underline"
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
            Paste it into <code className="rounded bg-surface-container px-1 py-0.5 text-xs">.env.local</code>{' '}
            as <code className="rounded bg-surface-container px-1 py-0.5 text-xs">VITE_GOOGLE_MAPS_API_KEY</code>.
          </li>
          <li>Restart the dev server.</li>
        </ol>
      </div>
    </div>
  )
}

export default App
