import { useState, useEffect } from "react";
import { toast } from "sonner"; // Changed from "@/components/ui/sonner" to "sonner"
import {
  Heart,
  MessageCircle,
  Repeat2,
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
  const [reposted, setReposted] = useState(false);
  const [repostCount, setRepostCount] = useState(0);
  const [isReposting, setIsReposting] = useState(false);

  // Load comments immediately when component mounts
  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/posts/${post.id}/comments`);
        if (response.ok) {
          const data = await response.json();
          setComments(data.comments);
        } else {
          throw new Error("Failed to load comments");
        }
      } catch (error) {
        console.error("Error loading comments:", error);
        // Updated toast usage for Sonner
        toast.error("Failed to load comments. Please try again.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [post.id]);

  const handleLike = async () => {
    if (isLiking) return;

    setIsLiking(true);
    try {
      const response = await fetch(`/api/posts/${post.id}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        const data = await response.json();
        setLiked(data.liked);
        setLikeCount(data.likeCount);

        // Updated toast usage for Sonner
        if (data.liked) {
          toast.success("Post liked", {
            description: "You've liked this post",
            duration: 1500,
          });
        } else {
          toast("Post unliked", {
            description: "You've removed your like from this post",
            duration: 1500,
          });
        }
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to toggle like");
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      // Updated toast usage for Sonner
      toast.error("Failed to like post. Please try again.");
    } finally {
      setIsLiking(false);
    }
  };

  const handleRepost = async () => {
    if (isReposting) return;

    setIsReposting(true);
    try {
      setReposted(!reposted);
      setRepostCount(reposted ? repostCount - 1 : repostCount + 1);
      
      // Updated toast usage for Sonner
      if (!reposted) {
        toast.success("Post reposted", {
          description: "You've reposted this post",
          duration: 1500,
        });
      } else {
        toast("Post unreposted", {
          description: "You've removed your repost",
          duration: 1500,
        });
      }
    } catch (error) {
      console.error("Error toggling repost:", error);
      // Updated toast usage for Sonner
      toast.error("Failed to repost. Please try again.");
    } finally {
      setIsReposting(false);
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

        {/* Engagement stats - MODIFIED LAYOUT */}
        <div className="mt-4">
          {/* Fixed interaction bar */}
          <div className="flex items-start text-gray-500 text-sm">
            {/* Left side: Comment button with accordion trigger */}
            <div className="w-1/2">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="comments" className="border-none">
                  <AccordionTrigger 
                    className="p-0 hover:no-underline flex items-center"
                    onClick={loadComments}
                  >
                    <div className="flex items-center">
                      <MessageCircle size={18} />
                      <span className="ml-2">{post.comment_count}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="mt-3 space-y-4 border-t pt-3">
                      {/* Comments section (unchanged) */}
                      {isLoading ? (
                        <p className="text-sm text-gray-500">
                          Loading comments...
                        </p>
                      ) : comments.length > 0 ? (
                        comments.map((comment) => (
                          <div key={comment.id} className="flex gap-2 border-t pt-3">
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
            </div>
    
          {/* Right side: Other buttons */}
          <div className="w-1/2 flex justify-end space-x-8">
            {/* Repost button */}
            <div className="flex">
              <Button
                variant="ghost"
                size="sm"
                className={`flex items-start p-0 hover:bg-transparent ${reposted ? "text-green-500" : ""}`}
                onClick={handleRepost}
                disabled={isReposting}
              >
                <Repeat2 
                  size={18} 
                  className={`${reposted ? "fill-current" : ""} transition-colors hover:text-green-400`}
                />
              </Button>
              <span className="ml-2">{repostCount}</span>
            </div>

            {/* Like button */}
            <div className="flex">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-start p-0 hover:bg-transparent"
                onClick={handleLike}
                disabled={isLiking}
              >
                <Heart 
                  size={18} 
                  className={`${liked ? "fill-current text-red-500" : ""} transition-colors hover:text-red-400`}
                />
              </Button>
              <span className="ml-2">{likeCount}</span>
            </div>
          </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
