import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { executeQuery } from "@/lib/db";
import { decryptId } from "@/utils/cryptoUtils";

export async function DELETE(request, { params }) {
  const session = await auth();

  // Check if user is authenticated
  if (!session || !session.user) {
    return NextResponse.json(
      { error: "You must be logged in to delete a post" },
      { status: 401 }
    );
  }

  try {
    const encryptedPostId = params.postId;
    const postId = decryptId(encryptedPostId);

    if (!postId) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }

    // Get post information to check ownership
    const posts = await executeQuery("SELECT user_id FROM posts WHERE id = ?", [
      postId,
    ]);

    if (posts.length === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const post = posts[0];
    const currentUserId = session.user.id;

    // Check if user is the post owner or an admin
    let isAdmin = false;
    if (currentUserId) {
      const adminCheck = await executeQuery(
        `SELECT 1 FROM user_roles ur 
         JOIN roles r ON ur.role_id = r.id 
         WHERE ur.user_id = ? AND r.name = 'admin'
         LIMIT 1`,
        [currentUserId]
      );
      isAdmin = adminCheck.length > 0;
    }

    if (post.user_id !== currentUserId && !isAdmin) {
      return NextResponse.json(
        { error: "You do not have permission to delete this post" },
        { status: 403 }
      );
    }

    // Delete related records in the correct order to respect foreign key constraints

    // 1. Delete comment likes for comments on this post
    await executeQuery(
      "DELETE FROM comment_likes WHERE comment_id IN (SELECT id FROM comments WHERE post_id = ?)",
      [postId]
    );

    // 2. Delete comments on this post
    await executeQuery("DELETE FROM comments WHERE post_id = ?", [postId]);

    // 3. Delete likes on this post
    await executeQuery("DELETE FROM likes WHERE post_id = ?", [postId]);

    // 4. Delete reposts of this post (this was missing!)
    await executeQuery("DELETE FROM reposts WHERE post_id = ?", [postId]);

    // 5. Delete post-hashtag relationships
    await executeQuery("DELETE FROM post_hashtags WHERE post_id = ?", [postId]);

    // 6. Finally, delete the post itself
    await executeQuery("DELETE FROM posts WHERE id = ?", [postId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}
