"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function CreatePost({ onPostCreated }) {
  const { data: session, status } = useSession();
  const [post, setPost] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const MAX_CHARS = 280;
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      status !== "authenticated" ||
      !session?.user?.id ||
      post.trim() === "" ||
      post.length > MAX_CHARS
    ) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: post,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create post");
      }

      // Fetch the newly created post from API to get correct user data
      try {
        const postResponse = await fetch(`/api/posts?limit=10&offset=0`);
        if (postResponse.ok) {
          const posts = await postResponse.json();
          const newPost = posts.find(p => p.encryptedId === data.encryptedId);
          if (newPost && onPostCreated) {
            onPostCreated(newPost);
          }
        }
      } catch (fetchError) {
        console.error('Error fetching new post:', fetchError);
        // Fallback to optimistic update without avatar
        const fallbackPost = {
          encryptedId: data.encryptedId,
          body: post,
          createdAt: new Date().toISOString(),
          likesCount: 0,
          commentsCount: 0,
          isPublic: true,
          isLiked: false,
          user: {
            username: session.user.username,
            avatar: null,
            name: session.user.username,
          },
          comments: [],
          likes: [],
        };
        if (onPostCreated) {
          onPostCreated(fallbackPost);
        }
      }

      // Show success toast
      toast.success("Post created", {
        description: (
          <span>
            Your post has been published!{" "}
            <button
              onClick={() => router.push(`/posts/${data.encryptedId}`)}
              className="text-blue-500 underline hover:text-blue-700"
            >
              View post
            </button>
          </span>
        ),
        duration: 3000,
      });

      // Clear the form
      setPost("");
      
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post", {
        description: "Please try again later",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-xl rounded-xl px-1 py-2 md:p-4">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3">
          <div className="flex-1 flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={session?.user?.avatar}
                  alt={session?.user?.name || "Profile"}
                />
                <AvatarFallback>
                  {session?.user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="w-full">
                <Textarea
                  value={post}
                  onChange={(e) => setPost(e.target.value)}
                  placeholder={
                    status === "authenticated"
                      ? "What's happening?"
                      : "Sign in to post"
                  }
                  disabled={status !== "authenticated"}
                  className="min-h-24 bg-accent text-base resize-none border-none focus-visible:ring-0 placeholder:text-gray-500 p-2"
                />
                <div className="flex justify-between">
                  <div className="text-sm text-gray-500">
                    {post.length > 0 && (
                      <span
                        className={
                          post.length > MAX_CHARS ? "text-red-500" : ""
                        }
                      >
                        {post.length}/{MAX_CHARS}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-end items-center mt-4">
                    <Button
                      type="submit"
                      disabled={
                        status !== "authenticated" ||
                        post.length === 0 ||
                        post.length > MAX_CHARS ||
                        isSubmitting
                      }
                      className="rounded-full bg-blue-500 hover:bg-blue-600 text-white px-5 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <span className="animate-spin">
                          <Loader2 />
                        </span>
                      ) : (
                        "Post"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}