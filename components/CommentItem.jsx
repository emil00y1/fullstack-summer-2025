// components/CommentItem.jsx
"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import { formatTimeAgo } from "@/lib/dateUtils";
import { useRouter } from "next/navigation";
import LikeButton from "@/components/LikeButton";
import { ReplyIcon } from "lucide-react";
import Link from "next/link";

export default function CommentItem({ comment, showParentPost = false }) {
  const router = useRouter();

  const createdAt = comment.createdAt
    ? formatTimeAgo(comment.createdAt)
    : "recently";

  return (
    <div className="px-1 py-2 md:p-4 hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors">
      {showParentPost && comment.post && (
        <Link
          className="mb-1 flex items-center gap-1 text-xs text-gray-500 hover:text-blue-500 cursor-pointer"
          href={`/posts/${comment.post.encryptedId}`}
        >
          <ReplyIcon size={12} className="rotate-180" />
          <span>replied to</span>
          <span className="font-medium text-blue-500 hover:underline">
            {comment.post.user.username}&apos;s post
          </span>
        </Link>
      )}
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
            <LikeButton
              initialIsLiked={comment.isLiked}
              initialLikesCount={comment.likesCount}
              postEncryptedId={comment.postEncryptedId}
              commentEncryptedId={comment.encryptedId}
              onLikeError={(error) =>
                console.error("Comment like error:", error)
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
