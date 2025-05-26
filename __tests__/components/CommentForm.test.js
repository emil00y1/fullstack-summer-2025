import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CommentForm from '@/app/posts/[postId]/CommentForm';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

jest.mock('next-auth/react');
jest.mock('next/navigation');
global.fetch = jest.fn();

describe('CommentForm Component', () => {
  const mockRefresh = jest.fn();

  beforeEach(() => {
    useRouter.mockReturnValue({ refresh: mockRefresh });
    fetch.mockClear();
    mockRefresh.mockClear();
  });

  it('renders comment form when authenticated', () => {
    useSession.mockReturnValue({
      data: {
        user: { id: 'user-123', username: 'testuser', avatar: 'avatar.jpg' },
      },
    });

    render(<CommentForm encryptedPostId='encrypted-post-id' />);

    expect(screen.getByPlaceholderText('Post your reply')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reply/i })).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });

  it('disables reply button when comment is empty', () => {
    useSession.mockReturnValue({
      data: { user: { id: 'user-123', username: 'testuser' } },
    });

    render(<CommentForm encryptedPostId='encrypted-post-id' />);

    const replyButton = screen.getByRole('button', { name: /reply/i });
    expect(replyButton).toBeDisabled();
  });

  it('enables reply button when comment has content', () => {
    useSession.mockReturnValue({
      data: { user: { id: 'user-123', username: 'testuser' } },
    });

    render(<CommentForm encryptedPostId='encrypted-post-id' />);

    const textarea = screen.getByPlaceholderText('Post your reply');
    const replyButton = screen.getByRole('button', { name: /reply/i });

    fireEvent.change(textarea, { target: { value: 'Great post!' } });
    expect(replyButton).not.toBeDisabled();
  });

  it('successfully submits comment', async () => {
    useSession.mockReturnValue({
      data: { user: { id: 'user-123', username: 'testuser' } },
    });

    fetch.mockResolvedValueOnce({ ok: true });

    render(<CommentForm encryptedPostId='encrypted-post-id' />);

    const textarea = screen.getByPlaceholderText('Post your reply');
    const replyButton = screen.getByRole('button', { name: /reply/i });

    fireEvent.change(textarea, { target: { value: 'Great post!' } });
    fireEvent.click(replyButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/posts/encrypted-post-id/comments',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: 'Great post!' }),
        }
      );
    });

    expect(mockRefresh).toHaveBeenCalled();
  });

  it('clears form after successful submission', async () => {
    useSession.mockReturnValue({
      data: { user: { id: 'user-123', username: 'testuser' } },
    });

    fetch.mockResolvedValueOnce({ ok: true });

    render(<CommentForm encryptedPostId='encrypted-post-id' />);

    const textarea = screen.getByPlaceholderText('Post your reply');

    fireEvent.change(textarea, { target: { value: 'Great post!' } });
    fireEvent.click(screen.getByRole('button', { name: /reply/i }));

    await waitFor(() => {
      expect(textarea.value).toBe('');
    });
  });
});
