import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddPlaceDialog } from './AddPlaceDialog'
import type { PickedPlace } from './PlaceSearch'
import type { Collection } from '../types'
import { createMockUseAppState } from '../test/mockUseAppState'

const state = {
  userId: 'me-123',
  collections: [
    { id: 'col-1', name: 'Existing collection', createdAt: 0, creatorId: 'me-123' },
  ] as Collection[],
}

const createCollection = vi.fn((_input: { name: string }) => 'new-col-id')
const { useAppState } = createMockUseAppState(state)

vi.mock('../store', () => ({
  useAppState: (selector: (s: typeof state) => unknown) => useAppState(selector),
  actions: { createCollection: (input: { name: string }) => createCollection(input) },
}))

const picked: PickedPlace = { name: 'Cafe Du Jour', lat: 1, lng: 2 }

beforeEach(() => {
  createCollection.mockClear()
})

describe('AddPlaceDialog', () => {
  // Regression test: the store selector here used to do `s.collections.filter(...)`
  // inline, returning a new array every render and triggering an infinite update
  // loop (React "Maximum update depth exceeded") that blanked the whole Add screen.
  it('renders without an infinite render loop when a collection list is present', () => {
    expect(() => render(<AddPlaceDialog picked={picked} onCancel={vi.fn()} onSave={vi.fn()} />)).not.toThrow()
    expect(screen.getByText('Existing collection')).toBeInTheDocument()
  })

  it('saves into an existing picked collection', async () => {
    const onSave = vi.fn()
    render(<AddPlaceDialog picked={picked} onCancel={vi.fn()} onSave={onSave} />)

    await userEvent.click(screen.getByText('Existing collection'))
    await userEvent.click(screen.getByRole('button', { name: 'Save spot' }))

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ collectionId: 'col-1', name: 'Cafe Du Jour' }))
    expect(createCollection).not.toHaveBeenCalled()
  })

  it('creates a new collection and saves into it', async () => {
    const onSave = vi.fn()
    render(<AddPlaceDialog picked={picked} onCancel={vi.fn()} onSave={onSave} />)

    await userEvent.click(screen.getByText('+ New collection…'))
    await userEvent.type(screen.getByPlaceholderText('New collection name…'), 'Athens trip')
    await userEvent.click(screen.getByRole('button', { name: 'Save spot' }))

    expect(createCollection).toHaveBeenCalledWith({ name: 'Athens trip' })
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ collectionId: 'new-col-id' }))
  })

  it('disables Save until a new collection is named, when you have no existing collections', () => {
    const original = state.collections
    state.collections = []
    try {
      render(<AddPlaceDialog picked={picked} onCancel={vi.fn()} onSave={vi.fn()} />)
      // With zero existing collections the dialog defaults straight into "creating
      // new" with an empty name, so Save starts disabled.
      expect(screen.getByRole('button', { name: 'Save spot' })).toBeDisabled()
    } finally {
      state.collections = original
    }
  })
})
