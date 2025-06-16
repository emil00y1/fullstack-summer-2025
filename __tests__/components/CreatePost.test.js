// __tests__/components/CreatePost.test.js
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CreatePost } from "@/components/CreatePost";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

describe("CreatePost Component", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    useRouter.mockReturnValue({ push: mockPush });
    useSession.mockReturnValue({
      data: { user: { id: "user-123", name: "Test User" } },
      status: "authenticated",
    });
    jest.clearAllMocks();
  });

  it("renders create post form when authenticated", () => {
    render(<CreatePost />);

    expect(
      screen.getByPlaceholderText("What's happening?")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /post/i })).toBeInTheDocument();
  });

  it("shows character count when typing", () => {
    render(<CreatePost />);

    const textarea = screen.getByPlaceholderText("What's happening?");
    fireEvent.change(textarea, { target: { value: "Hello world!" } });

    expect(screen.getByText("12/280")).toBeInTheDocument();
  });

  it("successfully creates a post", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        encryptedId: "encrypted-post-id",
      }),
    });

    render(<CreatePost />);

    const textarea = screen.getByPlaceholderText("What's happening?");
    const submitButton = screen.getByRole("button", { name: /post/i });

    fireEvent.change(textarea, { target: { value: "My new post!" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: "My new post!" }),
      });
    });
  });
});
