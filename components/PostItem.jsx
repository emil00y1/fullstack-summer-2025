// components/PostItem.jsx
"use client";
import { useState } from "react";
import { Heart, MessageSquare, Repeat, Share } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { useSession } from "next-auth/react";
import CommentItem from "./CommentItem";
import { formatTimeAgo } from "@/lib/dateUtils";

export default function PostItem({ post }) {
  const { data: session } = useSession();
  const [isLiked, setIsLiked] = useState(
    post.likes?.includes(session?.user?.id) || false
  );
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState(post.comments || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Format date with our custom function
  const createdAt = post.createdAt 
    ? formatTimeAgo(post.createdAt)
    : "recently";

  const handleLike = async () => {
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

  const handleComment = () => {
    setIsCommenting(!isCommenting);
  };

  const submitComment = async () => {
    if (!session || !commentText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/posts/${post.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ body: commentText }),
      });

      if (response.ok) {
        const newComment = await response.json();
        // Add the current user to the comment for display
        newComment.user = session.user;
        setComments(prev => [newComment, ...prev]);
        setCommentText("");
        setIsCommenting(false);
      }
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 border-b hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors">
      <div className="flex gap-3">
        {/* Avatar */}
        <Link href={`/users/${post.userId}`}>
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={post.user?.image || "https://github.com/shadcn.png"}
              alt={post.user?.name || "User"}
            />
            <AvatarFallback>
              {post.user?.name?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </Link>
        
        {/* Post content */}
        <div className="flex-1">
          {/* Post header */}
          <div className="flex items-center gap-1">
            <Link href={`/users/${post.userId}`} className="font-semibold hover:underline">
              {post.user?.name}
            </Link>
            <span className="text-gray-500">
              @{post.user?.username || post.user?.email?.split("@")[0]}
            </span>
            <span className="text-gray-500">·</span>
            <span className="text-gray-500 text-sm">{createdAt}</span>
          </div>
          
          {/* Post body */}
          <Link href={`/posts/${post.id}`}>
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
          </Link>
          
          {/* Action buttons */}
          <div className="flex justify-between mt-3">
            <Button
              onClick={handleComment}
              variant="ghost"
              className="text-gray-500 hover:text-blue-500"
              size="sm"
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              <span>{comments.length}</span>
            </Button>
            
            <Button
              variant="ghost"
              className="text-gray-500 hover:text-green-500"
              size="sm"
            >
              <Repeat className="h-4 w-4 mr-1" />
              <span>0</span>
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
            
            <Button
              variant="ghost"
              className="text-gray-500 hover:text-blue-500"
              size="sm"
            >
              <Share className="h-4 w-4 mr-1" />
            </Button>
          </div>
          
          {/* Comment form */}
          {isCommenting && (
            <div className="mt-3">
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write your reply..."
                className="resize-none"
                rows={2}
              />
              <div className="flex justify-end mt-2">
                <Button 
                  onClick={() => setIsCommenting(false)}
                  variant="ghost"
                  size="sm"
                  className="mr-2"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={submitComment}
                  disabled={!commentText.trim() || isSubmitting}
                  size="sm"
                >
                  Reply
                </Button>
              </div>
            </div>
          )}
          
          {/* Comments section */}
          {comments.length > 0 && (
            <div className="mt-3 pl-2 border-l">
              {comments.slice(0, 3).map((comment) => (
                <CommentItem 
                  key={comment.id} 
                  comment={comment} 
                  showParentPost={false}
                />
              ))}
              {comments.length > 3 && (
                <Link href={`/posts/${post.id}`} className="text-sm text-blue-500 mt-2 block">
                  Show all {comments.length} replies
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}