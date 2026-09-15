import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Profile } from './Profile'
import type { Place, Creator, Collection } from '../types'
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
})
