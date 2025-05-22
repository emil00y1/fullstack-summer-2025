// components/PostItem.jsx
"use client";
import { useState, useEffect } from "react";
import {
  MessageSquare,
  Repeat,
  MoreVertical,
  Globe,
  Lock,
  Loader2,
  Trash2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { formatTimeAgo } from "@/lib/dateUtils";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import LikeButton from "@/components/LikeButton";
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
} from "./ui/alert-dialog";

export default function PostItem({ post, isAdmin }) {
  const { data: session } = useSession();
  const router = useRouter();

  // Initialize state
  const [isReposted, setIsReposted] = useState(false);
  const [repostCount, setRepostCount] = useState(post.repostCount || 0);
  const [isPublic, setIsPublic] = useState(
    post.isPublic !== undefined ? post.isPublic : true
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Update isLiked state is now handled by the LikeButton component
  const createdAt = post.createdAt ? formatTimeAgo(post.createdAt) : "recently";
  const isOwnPost = session?.user?.username === post.user?.username;

  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const handleRepost = async (e) => {
    e.preventDefault();
    if (!session) {
      router.push("/login");
      return;
    }

    setIsReposted(!isReposted);
    setRepostCount((prev) => (isReposted ? prev - 1 : prev + 1));
  };

  const handleDelete = async (e) => {
    e.preventDefault();

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/posts/${post.encryptedId}/delete`, {
        method: "DELETE",
      });

      if (response.ok) {
        setIsAlertOpen(false);

        // Check current pathname to determine navigation behavior
        const currentPath = window.location.pathname;

        // If on individual post page, redirect to home
        if (currentPath.includes("/posts/")) {
          setTimeout(() => {
            router.push("/");
          }, 100);
        } else {
          // If on home page or profile page, just refresh
          setTimeout(() => {
            router.refresh();
          }, 100);
        }
      } else {
        throw new Error("Failed to delete post");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCommentClick = (e) => {
    e.preventDefault();
    router.push(`/posts/${post.encryptedId}#comment-input`);
  };

  const togglePrivacy = async (e) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      const response = await fetch(`/api/posts/${post.encryptedId}/privacy`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isPublic: !isPublic }),
      });

      if (response.ok) {
        setIsPublic(!isPublic);
      } else {
        throw new Error("Failed to update privacy");
      }
    } catch (error) {
      console.error("Error updating privacy:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="px-1 py-2 md:p-4 border-b hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors relative">
      {/* Top right dropdown for post owner */}
      {(isOwnPost || isAdmin) && (
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
              {isOwnPost && (
                <DropdownMenuItem
                  onClick={togglePrivacy}
                  className="cursor-pointer flex"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin justify-self-center" />
                  ) : isPublic ? (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      <span>Make Private</span>
                    </>
                  ) : (
                    <>
                      <Globe className="mr-2 h-4 w-4" />
                      <span>Make Public</span>
                    </>
                  )}
                </DropdownMenuItem>
              )}
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
                        delete this post.
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
              {/* Show privacy badge for private posts */}
              {!isPublic && (isOwnPost || isAdmin) && (
                <Badge variant="outline" className="ml-1 bg-gray-100">
                  <Lock className="h-3 w-3 mr-1" /> Private
                </Badge>
              )}
            </div>
          </div>

          <Link href={`/posts/${post.encryptedId}`} className="block">
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
          </Link>

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
              <LikeButton
                initialIsLiked={post.isLiked}
                initialLikesCount={post.likesCount}
                postEncryptedId={post.encryptedId}
                onLikeError={(error) => console.error("Like error:", error)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
