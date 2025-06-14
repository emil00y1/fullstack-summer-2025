// components/CommentItem.jsx
"use client";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { formatTimeAgo } from "@/lib/dateUtils";
import { useRouter } from "next/navigation";
import LikeButton from "@/components/LikeButton";
import HashtagText from "@/components/HashtagText";
import { ReplyIcon, MoreVertical, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function CommentItem({
  comment,
  showParentPost = false,
  isAdmin,
}) {
  const { data: session } = useSession();
  const router = useRouter();

  const [isDeleting, setIsDeleting] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const createdAt = comment.createdAt
    ? formatTimeAgo(comment.createdAt)
    : "recently";

  const isOwnComment = session?.user?.username === comment.user?.username;

  const handleDelete = async (e) => {
    e.preventDefault();
    setIsDeleting(true);

    try {
      const response = await fetch(
        `/api/comments/${comment.encryptedId}/delete`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setIsAlertOpen(false);
        // Refresh the page to update the comments
        setTimeout(() => {
          router.refresh();
        }, 100);
      } else {
        throw new Error("Failed to delete comment");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Failed to delete comment. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="px-1 py-2 md:p-4 hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors relative">
      {/* Delete dropdown for comment owner */}
      {(isOwnComment || isAdmin) && (
        <div className="absolute top-2 right-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 cursor-pointer"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="cursor-pointer"
                onSelect={(e) => e.preventDefault()}
              >
                <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                  <AlertDialogTrigger
                    className="flex text-red-600 cursor-pointer w-full items-center"
                    onClick={() => setIsAlertOpen(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2 text-red-600" />
                    <span>Delete</span>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete this reply.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="cursor-pointer">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="cursor-pointer bg-red-700 hover:bg-red-800"
                      >
                        {isDeleting ? (
                          <Loader2 className="animate-spin justify-self-center" />
                        ) : (
                          <>Continue</>
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

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
            <HashtagText text={comment.body} className="whitespace-pre-line" />
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
