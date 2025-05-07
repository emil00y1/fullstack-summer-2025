// components/PostItem.jsx
import { useState } from "react";
import { toast } from "sonner";
import {
  Heart,
  MessageCircle,
  Repeat2,
  BarChart2,
  Bookmark,
  Share,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function PostItem({ post }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  // For demo purposes, we'll use a hardcoded userId
  // In a real app, you'd get this from authentication
  const currentUserId = 1; // Using user ID 1 (john_doe) for demo

  const handleLike = async () => {
    if (isLiking) return;

    setIsLiking(true);
    try {
      const response = await fetch(`/api/posts/${post.id}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: currentUserId }),
      });

      if (response.ok) {
        const data = await response.json();
        setLiked(data.liked);
        setLikeCount(data.likeCount);

        toast(data.liked ? "Post liked" : "Post unliked", {
          description: data.liked
            ? "You've liked this post"
            : "You've removed your like from this post",
          duration: 1500,
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to toggle like");
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      toast("Error", {
        description: "Failed to like post. Please try again.",
        type: "error",
      });
    } finally {
      setIsLiking(false);
    }
  };

  const loadComments = async () => {
    if (comments.length === 0 && !isLoading) {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/posts/${post.id}/comments`);
        if (response.ok) {
          const data = await response.json();
          setComments(data.comments);
        } else {
          const error = await response.json();
          throw new Error(error.message || "Failed to load comments");
        }
      } catch (error) {
        console.error("Error loading comments:", error);
        toast("Error", {
          description: "Failed to load comments. Please try again.",
          type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Custom date formatting function
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();

    // Check if date is today
    if (date.toDateString() === now.toDateString()) {
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";
      const formattedHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
      const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
      return `Today at ${formattedHours}:${formattedMinutes} ${ampm}`;
    }

    // Check if date is yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }

    // Check if date is within the last 7 days
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);
    if (date > oneWeekAgo) {
      const daysOfWeek = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      return daysOfWeek[date.getDay()];
    }

    // For older dates, show the month and day
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${months[date.getMonth()]} ${date.getDate()}`;
  };

  // Format the date for display
  const formattedDate = formatDate(post.created_at);

  // Get user initials for avatar fallback
  const userInitials = post.username
    .split("_")
    .map((name) => name.charAt(0).toUpperCase())
    .join("");

  return (
    <div className="border border-gray-200 rounded-lg dark:border-gray-800 bg-white dark:bg-black text-black dark:text-white p-4 mb-4">
      {/* Header with profile pic and name */}
      <div className="flex items-start gap-3">
        <Avatar>
          <AvatarImage
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${post.username}`}
          />
          <AvatarFallback>{userInitials}</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          {/* User info */}
          <div className="flex items-center">
            <span className="font-bold mr-1">
              {post.username.replace("_", " ")}
            </span>
            <span className="text-gray-500 mx-1">@{post.username}</span>
            <span className="text-gray-500 mx-1">·</span>
            <span className="text-gray-500">{formattedDate}</span>
            <div className="ml-auto">
              <span className="text-gray-500">...</span>
            </div>
          </div>

          {/* Post content */}
          <div className="mt-1">
            <p className="text-base">{post.content}</p>
          </div>

          {/* Engagement stats */}
          <div className="flex justify-between mt-4 text-gray-500 text-sm">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="comments" className="border-none">
                <AccordionTrigger
                  className="p-0 hover:no-underline"
                  onClick={loadComments}
                >
                  <div className="flex items-center">
                    <MessageCircle size={18} />
                    <span className="ml-2">{post.comment_count}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="mt-4 space-y-4">
                    {isLoading ? (
                      <p className="text-sm text-gray-500">
                        Loading comments...
                      </p>
                    ) : comments.length > 0 ? (
                      comments.map((comment) => (
                        <div
                          key={comment.id}
                          className="flex gap-2 border-t pt-3"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={`https://api.dicebear.com/7.x/initials/svg?seed=${comment.username}`}
                            />
                            <AvatarFallback>
                              {comment.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center">
                              <span className="font-bold text-sm">
                                {comment.username}
                              </span>
                              <span className="text-gray-500 text-xs ml-2">
                                {formatDate(comment.created_at)}
                              </span>
                            </div>
                            <p className="text-sm">{comment.content}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No comments yet.</p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="flex items-center">
              <Repeat2 size={18} />
              <span className="ml-2">0</span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center p-0 ${liked ? "text-red-500" : ""}`}
              onClick={handleLike}
              disabled={isLiking}
            >
              <Heart size={18} className={liked ? "fill-current" : ""} />
              <span className="ml-2">{likeCount}</span>
            </Button>

            <div className="flex items-center">
              <BarChart2 size={18} />
              <span className="ml-2">0</span>
            </div>

            <div className="flex items-center">
              <Bookmark size={18} />
            </div>

            <div className="flex items-center">
              <Share size={18} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
