// app/posts/[postId]/CommentForm.jsx
"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";

export default function CommentForm({ postId }) {
  const { data: session } = useSession();
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const commentInputRef = useRef(null);
  
  // Auto focus the comment input if the URL contains #comment-input
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#comment-input' && commentInputRef.current) {
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
      const response = await fetch(`/api/posts/${postId}/comments`, {
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
          src= {session?.user?.avatar || "https://github.com/shadcn.png"}
          alt={session?.user?.username || "User"}
        />
        <AvatarFallback>
          {session?.user?.username?.[0]?.toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        <Textarea
          id="comment-input"
          ref={commentInputRef}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Post your reply"
          className="resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-2 min-h-[80px]"
        />
        <div className="flex justify-end mt-2">
          <Button 
            onClick={submitComment}
            disabled={!commentText.trim() || isSubmitting}
            size="sm"
            className="rounded-full px-4 cursor-pointer"
          >
            Reply
          </Button>
        </div>
      </div>
    </div>
  );
}