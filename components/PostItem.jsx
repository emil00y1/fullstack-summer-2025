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
  const [repostCount, setRepostCount] = useState(post.repostCount || 0);

  const createdAt = post.createdAt ? formatTimeAgo(post.createdAt) : "recently";

  const handleLike = async (e) => {
    e.preventDefault();
    if (!session) {
      router.push("/login");
      return;
    }

    try {
      const endpoint = `/api/posts/${post.encryptedId}/like`;
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

  const handleRepost = async (e) => {
    e.preventDefault();
    if (!session) {
      router.push("/login");
      return;
    }

    setIsReposted(!isReposted);
    setRepostCount((prev) => (isReposted ? prev - 1 : prev + 1));
  };

  const handleCommentClick = (e) => {
    e.preventDefault();
    router.push(`/posts/${post.encryptedId}#comment-input`);
  };

  return (
    <Link href={`/posts/${post.encryptedId}`} className="block">
      <div className="px-1 py-2 md:p-4 border-b hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors">
        <div className="flex gap-3">
          <div
            onClick={(e) => {
              e.preventDefault();
              router.push(`/user/${post.user.username}`);
            }}
          >
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={post.user?.avatar}
                alt={post.user?.name || "User"}
              />
              <AvatarFallback>
                {post.user?.username?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1">
            <div className="md:flex items-center gap-1">
              <span
                className="font-semibold hover:underline cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  router.push(`/user/${post.user.username}`);
                }}
              >
                {post.user?.username}
              </span>
              <div className="flex gap-1 items-center">
                <span className="text-gray-500 text-sm md:text-base">
                  @{post.user?.username}
                </span>
                <span className="text-gray-500">·</span>
                <span className="text-gray-500 text-xs md:text-sm">
                  {createdAt}
                </span>
              </div>
            </div>
            <div className="mt-2 md:mt-1">
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
              <div>
                <Button
                  onClick={handleRepost}
                  variant="ghost"
                  className={`${
                    isReposted
                      ? "text-green-500"
                      : "text-gray-500 hover:text-green-500"
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
                    isLiked
                      ? "text-red-500"
                      : "text-gray-500 hover:text-red-500"
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
      </div>
    </Link>
  );
}
