import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Profile } from './Profile'
import type { Place, Creator, Collection, CustomCategory } from '../types'
import { createMockUseAppState } from '../test/mockUseAppState'

const me: Creator = {
  id: 'me-123',
  handle: 'you',
  name: 'You',
  avatarUrl: 'https://example.com/avatar.png',
  followerCount: 3,
  followingCount: 0,
}

const collection: Collection = {
  id: 'col-1',
  name: 'My trip',
  createdAt: 0,
  creatorId: 'me-123',
}

const places: Place[] = [
  { id: 'p-eating-1', collectionId: 'col-1', name: 'Cafe A', category: 'eating', lat: 0, lng: 0, createdAt: 0 },
  { id: 'p-eating-2', collectionId: 'col-1', name: 'Cafe B', category: 'eating', lat: 0, lng: 0, createdAt: 0 },
  { id: 'p-sight-1', collectionId: 'col-1', name: 'Museum', category: 'sightseeing', lat: 0, lng: 0, createdAt: 0 },
]

const state = {
  userId: 'me-123',
  creators: [me],
  collections: [collection],
  places,
  followedCreatorIds: [] as string[],
  customCategories: [] as CustomCategory[],
}

const { useAppState } = createMockUseAppState(state)

vi.mock('../store', () => ({
  useAppState: (selector: (s: typeof state) => unknown) => useAppState(selector),
  actions: { closeDetail: vi.fn(), openDetail: vi.fn() },
  signOut: vi.fn(),
}))

describe('Profile — Pins tab grouped by category', () => {
  it('groups pins under a header per category, in CATEGORIES order, and omits empty categories', async () => {
    render(<Profile />)
    await userEvent.click(screen.getByRole('button', { name: 'Pins' }))

    const headers = screen.getAllByText(/^Eating$|^Sightseeing$|^Shopping$|^Bars$|^Activities$|^Other$/)
    const headerOrder = headers.map((h) => h.textContent)
    expect(headerOrder).toEqual(['Eating', 'Sightseeing'])

    expect(screen.getByText('Cafe A')).toBeInTheDocument()
    expect(screen.getByText('Cafe B')).toBeInTheDocument()
    expect(screen.getByText('Museum')).toBeInTheDocument()
    expect(screen.queryByText('Shopping')).not.toBeInTheDocument()
  })

  it('shows "Cities" as the collections-tab label for your own profile', () => {
    render(<Profile />)
    expect(screen.getByRole('button', { name: 'Cities' })).toBeInTheDocument()
  })

  it('groups a pin with a custom category under its own header', async () => {
    const original = { places: state.places, customCategories: state.customCategories }
    state.customCategories = [
      { id: 'cat-mushroom', ownerId: 'me-123', label: 'Mushroom spots', color: '#466556', icon: 'leaf', createdAt: 0 },
    ]
    state.places = [
      ...places,
      { id: 'p-custom-1', collectionId: 'col-1', name: 'Forest patch', category: 'cat-mushroom', lat: 0, lng: 0, createdAt: 0 },
    ]
    try {
      render(<Profile />)
      await userEvent.click(screen.getByRole('button', { name: 'Pins' }))
      expect(screen.getByText('Mushroom spots')).toBeInTheDocument()
      expect(screen.getByText('Forest patch')).toBeInTheDocument()
    } finally {
      state.places = original.places
      state.customCategories = original.customCategories
    }
  })
})
