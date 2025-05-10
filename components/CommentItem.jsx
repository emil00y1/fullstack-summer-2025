// components/CommentItem.jsx
"use client";
import { useState } from "react";
import { Heart, MessageSquare, Repeat, Share } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { formatTimeAgo } from "@/lib/dateUtils";

export default function CommentItem({ comment, showParentPost = false }) {
  const { data: session } = useSession();
  const [isLiked, setIsLiked] = useState(
    comment.likes?.includes(session?.user?.id) || false
  );
  const [likesCount, setLikesCount] = useState(comment.likesCount || 0);

  // Format date with our custom function
  const createdAt = comment.createdAt 
    ? formatTimeAgo(comment.createdAt)
    : "recently";

  const handleLike = async () => {
    if (!session) return;

    try {
      const endpoint = `/api/posts/${comment.postId}/comments/${comment.id}/like`;
      const method = isLiked ? "DELETE" : "POST";
      
      const response = await fetch(endpoint, { method });
      
      if (response.ok) {
        setIsLiked(!isLiked);
        setLikesCount(prevCount => isLiked ? prevCount - 1 : prevCount + 1);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  return (
    <div className="p-4 border-b hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors">
      {/* Show parent post info (only when viewing from profile) */}
      {showParentPost && comment.post && (
        <div className="mb-2 text-sm text-gray-500">
          <Link href={`/posts/${comment.postId}`} className="hover:underline">
            Replying to <span className="text-blue-500">@{comment.post.user?.username || comment.post.user?.email?.split("@")[0]}</span>
          </Link>
        </div>
      )}
      
      <div className="flex gap-3">
        {/* Avatar */}
        <Link href={`/users/${comment.userId}`}>
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={comment.user?.avatar || "https://picsum.photos/200"}
              alt={comment.user?.name || "User"}
            />
            <AvatarFallback>
              {comment.user?.name?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </Link>
        
        {/* Comment content */}
        <div className="flex-1">
          {/* Comment header */}
          <div className="flex items-center gap-1">
            <Link href={`/users/${comment.userId}`} className="font-semibold hover:underline">
              {comment.user?.name}
            </Link>
            <span className="text-gray-500">
              @{comment.user?.username || comment.user?.email?.split("@")[0]}
            </span>
            <span className="text-gray-500">·</span>
            <span className="text-gray-500 text-sm">{createdAt}</span>
          </div>
          
          {/* Comment body */}
          <div className="mt-1">
            <p className="whitespace-pre-line">{comment.body}</p>
          </div>
          
          {/* Action buttons */}
          <div className="flex justify-start gap-6 mt-2">
            <Button
              variant="ghost"
              className="text-gray-500 hover:text-blue-500 p-0 h-auto"
              size="sm"
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              <span className="text-xs">0</span>
            </Button>
            
            <Button
              variant="ghost"
              className="text-gray-500 hover:text-green-500 p-0 h-auto"
              size="sm"
            >
              <Repeat className="h-4 w-4 mr-1" />
              <span className="text-xs">0</span>
            </Button>
            
            <Button
              onClick={handleLike}
              variant="ghost"
              className={`p-0 h-auto ${
                isLiked ? "text-red-500" : "text-gray-500 hover:text-red-500"
              }`}
              size="sm"
            >
              <Heart className="h-4 w-4 mr-1" fill={isLiked ? "currentColor" : "none"} />
              <span className="text-xs">{likesCount}</span>
            </Button>
            
            <Button
              variant="ghost"
              className="text-gray-500 hover:text-blue-500 p-0 h-auto"
              size="sm"
            >
              <Share className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}