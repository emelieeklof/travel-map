import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddPlaceDialog } from './AddPlaceDialog'
import type { PickedPlace } from './PlaceSearch'
import type { Collection, CustomCategory } from '../types'
import { createMockUseAppState } from '../test/mockUseAppState'

const state = {
  userId: 'me-123',
  collections: [
    { id: 'col-1', name: 'Existing collection', createdAt: 0, creatorId: 'me-123' },
  ] as Collection[],
  customCategories: [] as CustomCategory[],
}

const createCollection = vi.fn((_input: { name: string }) => 'new-col-id')
const createCustomCategory = vi.fn((_input: { label: string }) => 'new-cat-id')
const { useAppState } = createMockUseAppState(state)

vi.mock('../store', () => ({
  useAppState: (selector: (s: typeof state) => unknown) => useAppState(selector),
  actions: {
    createCollection: (input: { name: string }) => createCollection(input),
    createCustomCategory: (input: { label: string }) => createCustomCategory(input),
  },
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
    expect(() =>
      render(<AddPlaceDialog picked={picked} onCancel={vi.fn()} onSave={vi.fn()} onDone={vi.fn()} />),
    ).not.toThrow()
    expect(screen.getByText('Existing collection')).toBeInTheDocument()
  })

  it('saves into an existing picked collection and finishes without a "create another" streak', async () => {
    const onSave = vi.fn()
    const onDone = vi.fn()
    render(<AddPlaceDialog picked={picked} onCancel={vi.fn()} onSave={onSave} onDone={onDone} />)

    await userEvent.click(screen.getByText('Existing collection'))
    await userEvent.click(screen.getByRole('button', { name: 'Save spot' }))

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ collectionId: 'col-1', name: 'Cafe Du Jour' }))
    expect(createCollection).not.toHaveBeenCalled()
    expect(onDone).toHaveBeenCalledWith(1)
  })

  it('creates a new collection and saves into it', async () => {
    const onSave = vi.fn()
    render(<AddPlaceDialog picked={picked} onCancel={vi.fn()} onSave={onSave} onDone={vi.fn()} />)

    await userEvent.click(screen.getByText('+ New city…'))
    await userEvent.type(screen.getByPlaceholderText('New city name…'), 'Athens trip')
    await userEvent.click(screen.getByRole('button', { name: 'Save spot' }))

    expect(createCollection).toHaveBeenCalledWith({ name: 'Athens trip' })
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ collectionId: 'new-col-id' }))
  })

  it('disables Save until a new collection is named, when you have no existing collections', () => {
    const original = state.collections
    state.collections = []
    try {
      render(<AddPlaceDialog picked={picked} onCancel={vi.fn()} onSave={vi.fn()} onDone={vi.fn()} />)
      // With zero existing collections the dialog defaults straight into "creating
      // new" with an empty name, so Save starts disabled.
      expect(screen.getByRole('button', { name: 'Save spot' })).toBeDisabled()
    } finally {
      state.collections = original
    }
  })

  it('keeps the dialog open and carries over the city when "Create another" is checked', async () => {
    const onSave = vi.fn()
    const onDone = vi.fn()
    render(<AddPlaceDialog picked={picked} onCancel={vi.fn()} onSave={onSave} onDone={onDone} />)

    await userEvent.click(screen.getByText('Existing collection'))
    await userEvent.click(screen.getByRole('checkbox', { name: 'Create another' }))
    await userEvent.click(screen.getByRole('button', { name: 'Save spot' }))

    // Dialog stays open (still rendering the City field) and hasn't reported done yet.
    expect(onSave).toHaveBeenCalledTimes(1)
    expect(onDone).not.toHaveBeenCalled()
    expect(screen.getByText('Existing collection')).toBeInTheDocument()
    // Save is disabled again until the next place is searched/picked.
    expect(screen.getByRole('button', { name: 'Save spot' })).toBeDisabled()
  })
})
