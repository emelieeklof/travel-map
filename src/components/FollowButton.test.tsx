import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FollowButton } from './FollowButton'
import { createMockUseAppState } from '../test/mockUseAppState'

const state = {
  followedCreatorIds: [] as string[],
  userId: 'me-123',
}

const followCreator = vi.fn()
const unfollowCreator = vi.fn()
const { useAppState } = createMockUseAppState(state)

vi.mock('../store', () => ({
  useAppState: (selector: (s: typeof state) => unknown) => useAppState(selector),
  actions: {
    followCreator: (id: string) => followCreator(id),
    unfollowCreator: (id: string) => unfollowCreator(id),
  },
}))

beforeEach(() => {
  state.followedCreatorIds = []
  state.userId = 'me-123'
  followCreator.mockClear()
  unfollowCreator.mockClear()
})

describe('FollowButton', () => {
  it('renders nothing for your own profile', () => {
    const { container } = render(<FollowButton creatorId="me-123" />)
    expect(container).toBeEmptyDOMElement()
  })

  it('shows "Follow" when not following, and calls followCreator on click', async () => {
    render(<FollowButton creatorId="sarah" />)
    const button = screen.getByRole('button', { name: 'Follow' })
    await userEvent.click(button)
    expect(followCreator).toHaveBeenCalledWith('sarah')
    expect(unfollowCreator).not.toHaveBeenCalled()
  })

  it('shows "Following" when already following, and calls unfollowCreator on click', async () => {
    state.followedCreatorIds = ['sarah']
    render(<FollowButton creatorId="sarah" />)
    const button = screen.getByRole('button', { name: 'Following' })
    await userEvent.click(button)
    expect(unfollowCreator).toHaveBeenCalledWith('sarah')
    expect(followCreator).not.toHaveBeenCalled()
  })
})
