import { auth } from "@/auth";
import { executeQuery } from "@/lib/db";
import PostItem from "@/components/PostItem";
import CommentItem from "@/components/CommentItem";
import CommentForm from "./CommentForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SessionProvider } from "next-auth/react";
import BackButton from "@/components/BackButton";
import { decryptId, encryptId } from "@/utils/cryptoUtils";

export default async function PostPage({ params }) {
  const { postId: encryptedPostId } = params;
  let postId;
  try {
    postId = decryptId(encryptedPostId);
  } catch (error) {
    return (
      <div className="max-w-xl mx-auto p-4">
        <div className="flex items-center p-4">
          <Link href="/">
            <Button variant="ghost">←</Button>
          </Link>
          <h1 className="text-xl font-bold ml-4">Invalid Post</h1>
        </div>
        <div className="text-center py-8">
          <p>
            The post you're looking for doesn't exist or the link is invalid.
          </p>
          <Link href="/" className="text-blue-500 mt-4 block">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const session = await auth();

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
    encryptedId: encryptedPostId,
    body: posts[0].content,
    createdAt: posts[0].created_at,
    likesCount: posts[0].like_count,
    commentsCount: posts[0].comment_count,
    user: {
      username: posts[0].username,
      avatar: posts[0].avatar,
      name: posts[0].username,
    },
    likes: [],
  };

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

  const formattedComments = comments.map((comment) => ({
    encryptedId: encryptId(comment.id),
    body: comment.body,
    createdAt: comment.created_at,
    postId: encryptId(comment.post_id),
    likesCount: comment.like_count || 0,
    user: {
      username: comment.username,
      name: comment.username,
      avatar: comment.avatar,
    },
    likes: [],
  }));

  return (
    <div className="max-w-xl mx-auto p-4">
      <div className="flex items-center p-4 border-b">
        <BackButton href="/" />
        <h1 className="text-xl font-bold ml-4">Post</h1>
      </div>
      <div className="border-b">
        <PostItem post={post} />
      </div>
      <div className="py-2 px-4 border-b" id="comment-section">
        {session ? (
          <CommentForm encryptedPostId={encryptedPostId} />
        ) : (
          <div className="py-4 text-center">
            <Link href="/login" className="text-blue-500">
              Log in to comment
            </Link>
          </div>
        )}
      </div>
      <div className="divide-y">
        {formattedComments.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            No replies yet. Be the first to reply!
          </div>
        ) : (
          formattedComments.map((comment) => (
            <CommentItem
              key={comment.encryptedId}
              comment={comment}
              showParentPost={false}
            />
          ))
        )}
      </div>
    </div>
  );
}
