// app/api/posts/[postId]/like/route.js
import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { auth } from "@/auth";
import { decryptId } from "@/utils/cryptoUtils";
import { v4 as uuidv4 } from "uuid";

// POST - Add a like
export async function POST(request, context) {
  try {
    // Get params from context
    const { params } = context;
    const postId = params.postId;

    // Get the authenticated user
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: "You must be logged in to like posts" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Validate post ID
    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }

    // Decrypt the post ID
    let decryptedPostId;
    try {
      decryptedPostId = decryptId(postId);
    } catch (error) {
      console.error("Error decrypting post ID:", error);
      return NextResponse.json(
        { error: "Invalid post ID format" },
        { status: 400 }
      );
    }

    // Verify the post exists
    const postCheck = await executeQuery("SELECT id FROM posts WHERE id = ?", [
      decryptedPostId,
    ]);

    if (postCheck.length === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Verify the user exists
    const userCheck = await executeQuery("SELECT id FROM users WHERE id = ?", [
      userId,
    ]);

    if (userCheck.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if the user already liked the post
    const existingLike = await executeQuery(
      "SELECT id FROM likes WHERE post_id = ? AND user_id = ?",
      [decryptedPostId, userId]
    );

    if (existingLike.length > 0) {
      // User already liked the post, return conflict status
      return NextResponse.json(
        {
          error: "You already liked this post",
          likeId: existingLike[0].id,
        },
        { status: 409 }
      );
    }

    // Generate a UUID for the like
    const likeId = uuidv4();

    // User hasn't liked the post yet, so like it
    await executeQuery(
      "INSERT INTO likes (id, post_id, user_id, created_at) VALUES (?, ?, ?, NOW())",
      [likeId, decryptedPostId, userId]
    );

    return NextResponse.json({
      success: true,
      message: "Post liked successfully",
      likeId: likeId,
    });
  } catch (error) {
    console.error("Error liking post:", error);
    return NextResponse.json(
      { error: "Failed to process like action", message: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Remove a like
export async function DELETE(request, context) {
  try {
    // Get params from context
    const { params } = context;
    const postId = params.postId;

    // Get the authenticated user
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: "You must be logged in to unlike posts" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Validate post ID
    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }

    // Decrypt the post ID
    let decryptedPostId;
    try {
      decryptedPostId = decryptId(postId);
    } catch (error) {
      console.error("Error decrypting post ID:", error);
      return NextResponse.json(
        { error: "Invalid post ID format" },
        { status: 400 }
      );
    }

    // Check if the user actually liked the post
    const existingLike = await executeQuery(
      "SELECT id FROM likes WHERE post_id = ? AND user_id = ?",
      [decryptedPostId, userId]
    );

    if (existingLike.length === 0) {
      // User hasn't liked the post
      return NextResponse.json(
        { error: "You haven't liked this post" },
        { status: 404 }
      );
    }

    // Delete the like
    await executeQuery("DELETE FROM likes WHERE post_id = ? AND user_id = ?", [
      decryptedPostId,
      userId,
    ]);

    return NextResponse.json({
      success: true,
      message: "Post unliked successfully",
    });
  } catch (error) {
    console.error("Error unliking post:", error);
    return NextResponse.json(
      { error: "Failed to process unlike action", message: error.message },
      { status: 500 }
    );
  }
}
