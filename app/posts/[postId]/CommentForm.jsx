// app/posts/[postId]/CommentForm.jsx
"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

export default function CommentForm({ encryptedPostId }) {
  const { data: session } = useSession();
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const commentInputRef = useRef(null);

  // Auto focus the comment input if the URL contains #comment-input
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.location.hash === "#comment-input" &&
      commentInputRef.current
    ) {
      // Set a slight delay to ensure the element is fully rendered
      setTimeout(() => {
        commentInputRef.current.focus();
      }, 100);
    }
  }, []);

  const submitComment = async () => {
    if (!session || !commentText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/posts/${encryptedPostId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: commentText }), // Changed to 'content' instead of 'body'
      });

      if (response.ok) {
        setCommentText("");
        // Refresh the page to show the new comment
        router.refresh();
      }
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex gap-3 py-2">
      <Avatar className="h-10 w-10">
        <AvatarImage
          src={session?.user?.avatar}
          alt={session?.user?.username || "User"}
        />
        <AvatarFallback>
          {session?.user?.username?.[0]?.toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <div className="md:flex items-center gap-1">
          <p className="font-semibold">{session.user.username}</p>
          <span className="text-gray-500 text-sm md:text-base">
            @{session.user.username}
          </span>
        </div>
        <Textarea
          id="comment-input"
          ref={commentInputRef}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Post your reply"
          className="resize-none mt-4 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-2 min-h-[80px]"
        />
        <div className="flex justify-end mt-2">
          <Button
            onClick={submitComment}
            disabled={!commentText.trim() || isSubmitting}
            size="sm"
            className="rounded-full px-4 bg-blue-500 hover:bg-blue-600 cursor-pointer"
          >
            {(isSubmitting && <Loader2 className="animate-spin" />) || "Reply"}
          </Button>
        </div>
      </div>
    </div>
  );
}
