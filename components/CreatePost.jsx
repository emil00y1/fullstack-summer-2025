// components/CreatePost.jsx
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

export function CreatePost() {
  const { data: session, status } = useSession();
  const [post, setPost] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const MAX_CHARS = 280;

  console.log(session);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Don't proceed if not logged in or if content is invalid
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

      // Show success toast notification
      toast.success("Post created", {
        description: "Your post has been published successfully",
        duration: 1500,
      });

      // Clear the form
      setPost("");
    } catch (error) {
      console.error("Error creating post:", error);
      // Show error toast notification
      toast.error("Failed to create post", {
        description: "Please try again later",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-xl  rounded-xl px-1 py-2 md:p-4">
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
              <div className="w-full relative">
                <Textarea
                  value={post}
                  onChange={(e) => setPost(e.target.value)}
                  placeholder={
                    status === "authenticated"
                      ? "What's happening?"
                      : "Sign in to post"
                  }
                  disabled={status !== "authenticated"}
                  className="min-h-24 bg-accent text-base resize-none border-none focus-visible:ring-0 p-0 placeholder:text-gray-500 p-2"
                />
                <div className="text-sm text-gray-500 absolute top-1">
                  {post.length > 0 && (
                    <span
                      className={post.length > MAX_CHARS ? "text-red-500" : ""}
                    >
                      {post.length}/{MAX_CHARS}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end items-center">
              <Button
                type="submit"
                disabled={
                  status !== "authenticated" ||
                  post.length === 0 ||
                  post.length > MAX_CHARS ||
                  isSubmitting
                }
                className="rounded-full bg-blue-500 hover:bg-blue-600 px-5 cursor-pointer"
              >
                {isSubmitting ? "Posting..." : "Post"}
              </Button>
            </div>
            <Separator className="my-2" />
          </div>
        </div>
      </form>
    </div>
  );
}
