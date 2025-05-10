// app/posts/[postId]/page.jsx
import { auth } from "@/auth";
import { executeQuery } from "@/lib/db";
import PostItem from "@/components/PostItem";
import CommentItem from "@/components/CommentItem";
import CommentForm from "./CommentForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SessionProvider } from "next-auth/react";
import BackButton from "@/components/BackButton";

export default async function PostPage({ params }) {
  const { postId } = params;
  const session = await auth();
  
  // Fetch the post - removed u.name from the query
  const posts = await executeQuery(
    `SELECT 
      p.id, 
      p.content, 
      p.created_at, 
      p.is_public,
      u.id as user_id, 
      u.username,
      u.email,
      u.avatar,
      (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
      (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE p.id = ?`,
    [postId]
  );
  
  if (posts.length === 0) {
    return (
      <div className="max-w-xl mx-auto p-4">
        <div className="flex items-center p-4">
          <Link href="/">
            <Button variant="ghost">←</Button>
          </Link>
          <h1 className="text-xl font-bold ml-4">Post not found</h1>
        </div>
        <div className="text-center py-8">
          <p>The post you're looking for doesn't exist or has been removed.</p>
          <Link href="/" className="text-blue-500 mt-4 block">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }
  
  const post = {
    id: posts[0].id,
    body: posts[0].content,
    createdAt: posts[0].created_at,
    userId: posts[0].user_id,
    likesCount: posts[0].like_count,
    commentsCount: posts[0].comment_count,
    isPublic: posts[0].is_public === 1,
    user: {
      id: posts[0].user_id,
      username: posts[0].username,
      avatar: posts[0].avatar,
      name: posts[0].username,
      email: posts[0].email,
    },
    likes: []
  };
  
  // Fetch comments for this post - removed u.name from the query
  const comments = await executeQuery(
    `SELECT 
      c.id, 
      c.post_id, 
      c.user_id,
      c.content as body,
      c.created_at, 
      u.username,
      u.email,
      u.avatar,
      (SELECT COUNT(*) FROM likes WHERE post_id = c.id) as like_count
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.post_id = ?
    ORDER BY c.created_at DESC`,
    [postId]
  );
  
  // Format comments
  const formattedComments = comments.map(comment => ({
    id: comment.id,
    body: comment.body,
    createdAt: comment.created_at,
    userId: comment.user_id,
    postId: comment.post_id,
    likesCount: comment.like_count || 0,
    user: {
      id: comment.user_id,
      username: comment.username,
      name: comment.username,
      email: comment.email,
      avatar: comment.avatar,  
    },
    likes: []
  }));
  
  return (
    <div className="max-w-xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center p-4 border-b">
      <BackButton href="/"/>
        <h1 className="text-xl font-bold ml-4">Post</h1>
      </div>
      
      {/* Main post */}
      <div className="border-b">
            <PostItem post={post} />
      </div>
      
      {/* Comment form */}
      <div className="py-2 px-4 border-b" id="comment-section">
        {session ? (
            <CommentForm postId={postId} />
        ) : (
          <div className="py-4 text-center">
            <Link href="/login" className="text-blue-500">
              Log in to comment
            </Link>
          </div>
        )}
      </div>
      
      {/* Comments */}
      <div className="divide-y">
        {formattedComments.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            No replies yet. Be the first to reply!
          </div>
        ) : (
              formattedComments.map(comment => (
                <CommentItem 
                  key={comment.id}
                  comment={comment}
                  showParentPost={false}
                />
              ))
          )}
      </div>
    </div>
  );
}