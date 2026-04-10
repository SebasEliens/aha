import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MessagePage } from './components/MessagePage'
import * as api from '@/app/lib/api'

vi.mock('@/app/lib/api', () => ({
  getMessages: vi.fn(),
  postMessage: vi.fn(),
}))

describe('MessagePage', () => {
  beforeEach(() => {
    vi.mocked(api.getMessages).mockResolvedValue([])
    vi.mocked(api.postMessage).mockImplementation((text: string) =>
      Promise.resolve({
        id: 'test-id',
        text,
        timestamp: new Date().toISOString(),
        mocked: false,
      })
    )
  })

  it('renders message input and empty log after loading', async () => {
    render(<MessagePage />)
    expect(screen.getByPlaceholderText(/type a message/i)).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText(/no messages yet/i)).toBeInTheDocument()
    })
  })

  it('shows message in log when user sends and API succeeds', async () => {
    const user = userEvent.setup()
    render(<MessagePage />)
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/type a message/i)).toBeInTheDocument()
    })
    const input = screen.getByPlaceholderText(/type a message/i)
    await user.type(input, 'Hello')
    await user.click(screen.getByRole('button', { name: /send/i }))
    await waitFor(() => {
      expect(screen.getByText('Hello')).toBeInTheDocument()
    })
    expect(screen.queryByText(/MOCK/i)).not.toBeInTheDocument()
  })
})
