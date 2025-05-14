// app/api/posts/[postId]/comments/[commentId]/like/route.js
import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { auth } from "@/auth";
import { decryptId } from "@/utils/cryptoUtils";
import { v4 as uuidv4 } from "uuid";

// POST - Add a like to a comment
export async function POST(request, context) {
  try {
    // Get params from context
    const { params } = context;
    const { commentId, postId } = params;

    // Get the authenticated user
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: "You must be logged in to like comments" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Validate IDs
    if (!commentId || !postId) {
      return NextResponse.json(
        { error: "Comment ID and Post ID are required" },
        { status: 400 }
      );
    }

    // Decrypt IDs
    let decryptedCommentId, decryptedPostId;
    try {
      decryptedCommentId = decryptId(commentId);
      decryptedPostId = decryptId(postId);
    } catch (error) {
      console.error("Error decrypting IDs:", error);
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    // Verify the comment exists and belongs to the post
    const commentCheck = await executeQuery(
      "SELECT id FROM comments WHERE id = ? AND post_id = ?",
      [decryptedCommentId, decryptedPostId]
    );

    if (commentCheck.length === 0) {
      return NextResponse.json(
        { error: "Comment not found or does not belong to this post" },
        { status: 404 }
      );
    }

    // Verify the user exists
    const userCheck = await executeQuery("SELECT id FROM users WHERE id = ?", [
      userId,
    ]);

    if (userCheck.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if the user already liked the comment
    const existingLike = await executeQuery(
      "SELECT id FROM comment_likes WHERE comment_id = ? AND user_id = ?",
      [decryptedCommentId, userId]
    );

    if (existingLike.length > 0) {
      // User already liked the comment
      return NextResponse.json(
        {
          error: "You already liked this comment",
          likeId: existingLike[0].id,
        },
        { status: 409 }
      );
    }

    // Generate a UUID for the comment like
    const likeId = uuidv4();

    // Add the like
    await executeQuery(
      "INSERT INTO comment_likes (id, comment_id, user_id, created_at) VALUES (?, ?, ?, NOW())",
      [likeId, decryptedCommentId, userId]
    );

    return NextResponse.json({
      success: true,
      message: "Comment liked successfully",
      likeId: likeId,
    });
  } catch (error) {
    console.error("Error liking comment:", error);
    return NextResponse.json(
      { error: "Failed to process like action", message: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Remove a like from a comment
export async function DELETE(request, context) {
  try {
    // Get params from context
    const { params } = context;
    const { commentId, postId } = params;

    // Get the authenticated user
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: "You must be logged in to unlike comments" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Validate IDs
    if (!commentId || !postId) {
      return NextResponse.json(
        { error: "Comment ID and Post ID are required" },
        { status: 400 }
      );
    }

    // Decrypt IDs
    let decryptedCommentId, decryptedPostId;
    try {
      decryptedCommentId = decryptId(commentId);
      decryptedPostId = decryptId(postId);
    } catch (error) {
      console.error("Error decrypting IDs:", error);
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    // Check if the user actually liked the comment
    const existingLike = await executeQuery(
      "SELECT id FROM comment_likes WHERE comment_id = ? AND user_id = ?",
      [decryptedCommentId, userId]
    );

    if (existingLike.length === 0) {
      // User hasn't liked the comment
      return NextResponse.json(
        { error: "You haven't liked this comment" },
        { status: 404 }
      );
    }

    // Delete the like
    await executeQuery(
      "DELETE FROM comment_likes WHERE comment_id = ? AND user_id = ?",
      [decryptedCommentId, userId]
    );

    return NextResponse.json({
      success: true,
      message: "Comment unliked successfully",
    });
  } catch (error) {
    console.error("Error unliking comment:", error);
    return NextResponse.json(
      { error: "Failed to process unlike action", message: error.message },
      { status: 500 }
    );
  }
}
