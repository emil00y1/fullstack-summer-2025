// app/posts/[postId]/page.jsx
import { auth } from "@/auth";
import PostItem from "@/components/PostItem";
import CommentItem from "@/components/CommentItem";
import CommentForm from "./CommentForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import BackButton from "@/components/BackButton";
import { decryptId, encryptId } from "@/utils/cryptoUtils";
import { fetchPostWithLikes } from "@/lib/postUtils";
import { executeQuery } from "@/lib/db";

export default async function PostPage({ params }) {
  // Access params safely
  const params_obj = await params;
  const encryptedPostId = params_obj.postId;

  let postId;
  try {
    postId = decryptId(encryptedPostId);
  } catch (error) {
    console.error("Error decrypting post ID:", error);
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
  const userId = session?.user?.id;

  let isAdmin = false;
  if (userId) {
    const adminCheck = await executeQuery(
      `SELECT 1 FROM user_roles ur 
   JOIN roles r ON ur.role_id = r.id 
   WHERE ur.user_id = ? AND r.name = 'admin'
   LIMIT 1`,
      [userId]
    );
    isAdmin = adminCheck.length > 0;
  }

  // Use the reusable function to fetch the post with likes
  let postData;
  try {
    postData = await fetchPostWithLikes(postId, userId);

    if (!postData) {
      return (
        <div className="max-w-xl mx-auto p-4">
          <div className="flex items-center p-4">
            <Link href="/">
              <Button variant="ghost">←</Button>
            </Link>
            <h1 className="text-xl font-bold ml-4">Post not found</h1>
          </div>
          <div className="text-center py-8">
            <p>
              The post you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/" className="text-blue-500 mt-4 block">
              Return to Home
            </Link>
          </div>
        </div>
      );
    }

    // Format the post for the PostItem component
    const post = {
      encryptedId: encryptedPostId,
      body: postData.body,
      createdAt: postData.createdAt,
      likesCount: postData.likesCount,
      commentsCount: postData.commentsCount,
      isPublic: postData.isPublic,
      user: postData.user,
      likes: postData.likes,
      isLiked: postData.isLiked,
    };

    // Fetch comments with likes info
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
        COUNT(DISTINCT cl.id) as likesCount,
        GROUP_CONCAT(DISTINCT cl.user_id) as likeUserIds
      FROM comments c
      JOIN users u ON c.user_id = u.id
      LEFT JOIN comment_likes cl ON c.id = cl.comment_id
      WHERE c.post_id = ?
      GROUP BY c.id
      ORDER BY c.created_at DESC`,
      [postId]
    );

    const formattedComments = comments.map((comment) => {
      const likeUserIds = comment.likeUserIds
        ? comment.likeUserIds.split(",")
        : [];

      return {
        encryptedId: encryptId(comment.id),
        body: comment.body,
        createdAt: comment.created_at,
        postId: encryptId(comment.post_id),
        postEncryptedId: encryptedPostId,
        likesCount: comment.likesCount || 0,
        user: {
          id: comment.user_id,
          username: comment.username,
          name: comment.username,
          avatar: comment.avatar,
        },
        likes: likeUserIds,
        isLiked: userId ? likeUserIds.includes(userId) : false,
      };
    });

    return (
      <div className="max-w-xl mx-auto p-4">
        <div className="flex items-center p-4 border-b">
          <BackButton href="/" />
          <h1 className="text-xl font-bold ml-4">Post</h1>
        </div>
        <div className="border-b">
          <PostItem post={post} isAdmin={isAdmin} />
        </div>
        <div className="py-2 px-4 border-b" id="comment-section">
          {session ? (
            <CommentForm encryptedPostId={encryptedPostId} session={session} />
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
  } catch (error) {
    console.error("Error loading post:", error);
    return (
      <div className="max-w-xl mx-auto p-4">
        <div className="flex items-center p-4">
          <Link href="/">
            <Button variant="ghost">←</Button>
          </Link>
          <h1 className="text-xl font-bold ml-4">Error Loading Post</h1>
        </div>
        <div className="text-center py-8">
          <p>There was an error loading this post. Please try again.</p>
          <p className="text-sm text-gray-500">{error.message}</p>
          <Link href="/" className="text-blue-500 mt-4 block">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }
}
