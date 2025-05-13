"use client";
import { useState } from "react";
import { Heart } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { formatTimeAgo } from "@/lib/dateUtils";
import { useRouter } from "next/navigation";

export default function CommentItem({ comment, showParentPost = false }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(
    comment.likes?.includes(session?.user?.id) || false
  );
  const [likesCount, setLikesCount] = useState(comment.likesCount || 0);

  const createdAt = comment.createdAt
    ? formatTimeAgo(comment.createdAt)
    : "recently";

  const handleLike = async (e) => {
    e.preventDefault();
    if (!session) {
      router.push("/login");
      return;
    }

    try {
      const endpoint = `/api/posts/${comment.postId}/comments/${comment.encryptedId}/like`;
      const method = isLiked ? "DELETE" : "POST";

      const response = await fetch(endpoint, { method });

      if (response.ok) {
        setIsLiked(!isLiked);
        setLikesCount((prevCount) => (isLiked ? prevCount - 1 : prevCount + 1));
      } else {
        throw new Error("Failed to toggle like");
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  return (
    <div className="px-1 py-2 md:p-4 hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors">
      <div className="flex gap-3">
        <div
          onClick={(e) => {
            e.preventDefault();
            router.push(`/user/${comment.user.username}`);
          }}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={comment.user?.avatar}
              alt={comment.user?.name || "User"}
            />
            <AvatarFallback>
              {comment.user?.username?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-1">
          <div className="md:flex items-center gap-1">
            <span
              className="font-semibold hover:underline cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                router.push(`/user/${comment.user.username}`);
              }}
            >
              {comment.user?.username}
            </span>
            <div className="flex gap-1 items-center">
              <span className="text-gray-500 text-sm md:text-base">
                @{comment.user?.username}
              </span>
              <span className="text-gray-500">·</span>
              <span className="text-gray-500 text-xs md:text-sm">
                {createdAt}
              </span>
            </div>
          </div>
          <div className="mt-1">
            <p className="whitespace-pre-line">{comment.body}</p>
          </div>
          <div className="flex justify-start mt-2">
            <Button
              onClick={handleLike}
              variant="ghost"
              className={`${
                isLiked ? "text-red-500" : "text-gray-500 hover:text-red-500"
              }`}
              size="sm"
            >
              <Heart
                className="h-4 w-4 mr-1"
                fill={isLiked ? "currentColor" : "none"}
              />
              <span>{likesCount}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
