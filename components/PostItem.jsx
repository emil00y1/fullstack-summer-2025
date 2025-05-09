// components/PostItem.jsx
"use client";
import { useState } from "react";
import { Heart, MessageSquare, Repeat } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { formatTimeAgo } from "@/lib/dateUtils";
import { useRouter } from "next/navigation";

export default function PostItem({ post }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(
    post.likes?.includes(session?.user?.id) || false
  );
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [isReposted, setIsReposted] = useState(false);
  const [repostCount, setRepostCount] = useState(0);

  // Format date with our custom function
  const createdAt = post.createdAt 
    ? formatTimeAgo(post.createdAt)
    : "recently";

  const handleLike = async (e) => {
    e.preventDefault(); // Prevent clicking through to post page
    if (!session) return;

    try {
      const endpoint = `/api/posts/${post.id}/like`;
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

  const handleRepost = async (e) => {
    e.preventDefault(); // Prevent clicking through to post page
    if (!session) return;

    // Toggle repost state for immediate feedback
    setIsReposted(!isReposted);
    setRepostCount(prev => isReposted ? prev - 1 : prev + 1);

    // In a real app, you'd implement an API call for reposting
  };

  const handleCommentClick = (e) => {
    e.preventDefault(); // Prevent default link behavior
    router.push(`/posts/${post.id}#comment-input`);
  };

  return (
    <Link href={`/posts/${post.id}`} className="block">
      <div className="p-4 border-b hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors">
        <div className="flex gap-3">
          {/* Avatar */}
          <div onClick={(e) => {
            e.preventDefault();
            router.push(`/users/${post.userId}`);
          }}>
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={post.user?.image || "https://picsum.photos/200"}
                alt={post.user?.name || "User"}
              />
              <AvatarFallback>
                {post.user?.name?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </div>
          
          {/* Post content */}
          <div className="flex-1">
            {/* Post header */}
            <div className="flex items-center gap-1">
              <span 
                className="font-semibold hover:underline cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  router.push(`/users/${post.userId}`);
                }}
              >
                {post.user?.name}
              </span>
              <span className="text-gray-500">
                @{post.user?.username || post.user?.email?.split("@")[0]}
              </span>
              <span className="text-gray-500">·</span>
              <span className="text-gray-500 text-sm">{createdAt}</span>
            </div>
            
            {/* Post body */}
            <div className="mt-1">
              <p className="whitespace-pre-line">{post.body}</p>
              {post.image && (
                <div className="mt-3 rounded-xl overflow-hidden">
                  <img
                    src={post.image}
                    alt="Post"
                    className="w-full h-auto max-h-96 object-cover"
                  />
                </div>
              )}
            </div>
            
            {/* Action buttons */}
            <div className="flex justify-between mt-3">
              <Button
                onClick={handleCommentClick}
                variant="ghost"
                className="text-gray-500 hover:text-blue-500"
                size="sm"
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                <span>{post.commentsCount || 0}</span>
              </Button>
              
              <Button
                onClick={handleRepost}
                variant="ghost"
                className={`${
                  isReposted ? "text-green-500" : "text-gray-500 hover:text-green-500"
                }`}
                size="sm"
              >
                <Repeat className="h-4 w-4 mr-1" />
                <span>{repostCount}</span>
              </Button>
              
              <Button
                onClick={handleLike}
                variant="ghost"
                className={`${
                  isLiked ? "text-red-500" : "text-gray-500 hover:text-red-500"
                }`}
                size="sm"
              >
                <Heart className="h-4 w-4 mr-1" fill={isLiked ? "currentColor" : "none"} />
                <span>{likesCount}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}