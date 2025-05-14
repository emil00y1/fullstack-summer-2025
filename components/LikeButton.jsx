// components/LikeButton.jsx
"use client";
import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function LikeButton({
  initialIsLiked = false,
  initialLikesCount = 0,
  postEncryptedId, // Always use encrypted IDs
  commentEncryptedId = null, // Only for comments
  onLikeError = () => {},
  size = "sm",
  className = "",
}) {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const router = useRouter();
  const { data: session } = useSession();

  const handleLike = async (e) => {
    e.preventDefault();
    if (!session) {
      router.push("/login");
      return;
    }

    if (!postEncryptedId) {
      console.error("Missing post encrypted ID");
      return;
    }

    // Optimistic update
    setIsLiked(!isLiked);
    setLikesCount((prevCount) => (isLiked ? prevCount - 1 : prevCount + 1));

    try {
      // Determine the endpoint based on whether this is a post or comment like
      const endpoint = commentEncryptedId
        ? `/api/posts/${postEncryptedId}/comments/${commentEncryptedId}/like`
        : `/api/posts/${postEncryptedId}/like`;

      const method = isLiked ? "DELETE" : "POST";

      console.log(`Making ${method} request to ${endpoint}`);

      const response = await fetch(endpoint, { method });

      if (!response.ok) {
        // Revert optimistic update if server request fails
        setIsLiked(isLiked);
        setLikesCount((prevCount) => (isLiked ? prevCount : prevCount - 1));
        const error = await response.json();
        console.error("Error toggling like:", error);
        onLikeError(error);
      }
    } catch (error) {
      // Revert optimistic update if request fails
      setIsLiked(isLiked);
      setLikesCount((prevCount) => (isLiked ? prevCount : prevCount - 1));
      console.error("Error toggling like:", error);
      onLikeError(error);
    }
  };

  return (
    <Button
      onClick={handleLike}
      variant="ghost"
      className={`${
        isLiked ? "text-red-500" : "text-gray-500 hover:text-red-500"
      } ${className}`}
      size={size}
    >
      <Heart
        className="h-4 w-4 mr-1"
        fill={isLiked ? "currentColor" : "none"}
      />
      <span>{likesCount}</span>
    </Button>
  );
}
