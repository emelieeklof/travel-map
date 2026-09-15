import type { Collection, Creator, Place } from '../types'
import { actions } from '../store'

function coverPhotos(collection: Collection, places: Place[]): string[] {
  if (collection.coverPhotoUrls?.length) return collection.coverPhotoUrls
  return places
    .filter((p) => p.collectionId === collection.id && p.photoUrl)
    .slice(0, 2)
    .map((p) => p.photoUrl as string)
}

export function CollectionCard({
  collection,
  creator,
  pinCount,
  places,
}: {
  collection: Collection
  creator?: Creator
  pinCount: number
  places: Place[]
}) {
  const photos = coverPhotos(collection, places)

  return (
    <div className="rounded-md overflow-hidden bg-surface-container-lowest shadow-card border border-outline-variant/40 hover:shadow-float transition-shadow">
      <button
        onClick={() => actions.openDetail({ type: 'collection', id: collection.id })}
        className="block w-full text-left"
      >
        <div className="h-36 bg-surface-container-high overflow-hidden">
          {photos.length === 0 ? (
            <div className="h-full w-full flex items-center justify-center text-outline text-sm">No photos yet</div>
          ) : photos.length === 1 ? (
            <img
              src={photos[0]}
              alt=""
              className="h-36 w-full object-cover"
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
          ) : (
            <div className="grid grid-cols-2 gap-0.5 h-36">
              {photos.slice(0, 2).map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt=""
                  className="h-36 w-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                />
              ))}
            </div>
          )}
        </div>
        <div className={`px-3 pt-3 ${creator ? '' : 'pb-4'}`}>
          <div className="font-sans text-base font-bold text-on-surface leading-snug">
            {collection.name}
          </div>
          <div className="text-xs text-on-surface-variant mt-1 mb-2">{pinCount} pins</div>
        </div>
      </button>
      {creator && (
        <button
          onClick={() => actions.openDetail({ type: 'creator', id: creator.id })}
          className="flex items-center gap-1.5 px-3 pb-4 pt-1 w-full"
        >
          <img src={creator.avatarUrl} alt="" className="h-[18px] w-[18px] rounded-full bg-surface-container" />
          <span className="text-xs text-outline">Curated by</span>
          <span className="text-xs font-semibold text-on-surface">@{creator.handle}</span>
        </button>
      )}
    </div>
  )
}
