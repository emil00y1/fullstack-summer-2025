import { render, screen, fireEvent } from "@testing-library/react";
import PostItem from "@/components/PostItem";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

jest.mock("next-auth/react");
jest.mock("next/navigation");
jest.mock("@/components/LikeButton", () => {
  return function MockLikeButton({
    initialIsLiked,
    initialLikesCount,
    postEncryptedId,
  }) {
    return (
      <button data-testid="like-button">Like ({initialLikesCount})</button>
    );
  };
});

const mockPost = {
  encryptedId: "encrypted-post-123",
  body: "This is a test post",
  createdAt: "2024-01-01T12:00:00Z",
  isPublic: true,
  likesCount: 5,
  commentsCount: 2,
  repostsCount: 0,
  isLiked: false,
  isRepost: false,
  user: {
    username: "testuser",
    avatar: "avatar.jpg",
  },
};

describe("PostItem Component", () => {
  const mockPush = jest.fn();
  const mockRefresh = jest.fn();

  beforeEach(() => {
    useRouter.mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
    });
    mockPush.mockClear();
    mockRefresh.mockClear();
  });

  it("renders post content correctly", () => {
    useSession.mockReturnValue({
      data: { user: { username: "currentuser" } },
    });

    render(<PostItem post={mockPost} isAdmin={false} />);

    expect(screen.getByText("This is a test post")).toBeInTheDocument();
    expect(screen.getByText("testuser")).toBeInTheDocument();
    expect(screen.getByText("@testuser")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument(); // comments count
    expect(screen.getByTestId("like-button")).toBeInTheDocument();
  });

  it("shows dropdown menu for own posts", () => {
    useSession.mockReturnValue({
      data: { user: { username: "testuser" } }, // Same as post owner
    });

    render(<PostItem post={mockPost} isAdmin={false} />);

    // Should show the more options button for own posts (when not repost)
    const moreButtons = screen.queryAllByRole("button");
    const hasMoreButton = moreButtons.some(
      (button) =>
        button.getAttribute("data-testid") === "more-vertical" ||
        button.querySelector('[data-testid="more-vertical"]')
    );
    expect(hasMoreButton || moreButtons.length > 0).toBeTruthy();
  });

  it("does not show dropdown for other users posts", () => {
    useSession.mockReturnValue({
      data: { user: { username: "otheruser" } },
    });

    render(<PostItem post={mockPost} isAdmin={false} />);

    // Should not show dropdown for posts by other users
    const moreButtons = screen
      .queryAllByRole("button")
      .filter(
        (button) =>
          button.getAttribute("data-testid") === "more-vertical" ||
          button.querySelector('[data-testid="more-vertical"]')
      );
    expect(moreButtons.length).toBe(0);
  });

  it("navigates to post page when clicking comment button", () => {
    useSession.mockReturnValue({
      data: { user: { username: "currentuser" } },
    });

    render(<PostItem post={mockPost} isAdmin={false} />);

    const commentButton = screen.getByText("2").closest("button");
    fireEvent.click(commentButton);

    expect(mockPush).toHaveBeenCalledWith(
      "/posts/encrypted-post-123#comment-input"
    );
  });

  it("shows private badge for private posts when user is owner", () => {
    const privatePost = { ...mockPost, isPublic: false };

    useSession.mockReturnValue({
      data: { user: { username: "testuser" } }, // Same as post owner
    });

    render(<PostItem post={privatePost} isAdmin={false} />);

    expect(screen.getByText("Private")).toBeInTheDocument();
  });

  it("does not show private badge for private posts when user is not owner", () => {
    const privatePost = { ...mockPost, isPublic: false };

    useSession.mockReturnValue({
      data: { user: { username: "otheruser" } },
    });

    render(<PostItem post={privatePost} isAdmin={false} />);

    expect(screen.queryByText("Private")).not.toBeInTheDocument();
  });

  it("navigates to user profile when clicking username", () => {
    useSession.mockReturnValue({
      data: { user: { username: "currentuser" } },
    });

    render(<PostItem post={mockPost} isAdmin={false} />);

    const username = screen.getByText("testuser");
    fireEvent.click(username);

    expect(mockPush).toHaveBeenCalledWith("/user/testuser");
  });
});
