import { describe, expect, it } from 'vitest'
import { resolveDefaultViewport } from './mapViewport'

const fallback = { center: { lat: 38.7223, lng: -9.1393 }, zoom: 13 }

describe('resolveDefaultViewport', () => {
  it('prefers the last known viewport when present — this is the focus-mode zoom fix', () => {
    const lastViewport = { center: { lat: 1, lng: 2 }, zoom: 17 }
    const collection = { center: { lat: 99, lng: 99 }, zoom: 5 }
    expect(resolveDefaultViewport(lastViewport, collection, fallback)).toEqual(lastViewport)
  })

  it('falls back to the collection center/zoom when there is no last viewport yet', () => {
    const collection = { center: { lat: 40, lng: 5 }, zoom: 9 }
    expect(resolveDefaultViewport(null, collection, fallback)).toEqual({ center: collection.center, zoom: 9 })
  })

  it('falls back to the fallback zoom when the collection has a center but no zoom', () => {
    const collection = { center: { lat: 40, lng: 5 } }
    expect(resolveDefaultViewport(null, collection, fallback)).toEqual({ center: collection.center, zoom: fallback.zoom })
  })

  it('falls back to the hardcoded default when there is no last viewport and no active collection', () => {
    expect(resolveDefaultViewport(null, null, fallback)).toEqual(fallback)
  })
})
