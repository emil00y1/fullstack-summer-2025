// app/api/posts/[postId]/repost/route.js
import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { auth } from "@/auth";
import { decryptId } from "@/utils/cryptoUtils";
import { v4 as uuidv4 } from "uuid";

// POST - Create a repost
export async function POST(request, context) {
  try {
    const { params } = context;
    const postId = params.postId;

    // Get the authenticated user
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: "You must be logged in to repost" },
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
    const postCheck = await executeQuery(
      "SELECT id, user_id FROM posts WHERE id = ?",
      [decryptedPostId]
    );

    if (postCheck.length === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Prevent users from reposting their own posts
    if (postCheck[0].user_id === userId) {
      return NextResponse.json(
        { error: "You cannot repost your own post" },
        { status: 400 }
      );
    }

    // Check if the user already reposted this post
    const existingRepost = await executeQuery(
      "SELECT id FROM reposts WHERE post_id = ? AND user_id = ?",
      [decryptedPostId, userId]
    );

    if (existingRepost.length > 0) {
      return NextResponse.json(
        { error: "You have already reposted this post" },
        { status: 409 }
      );
    }

    // Generate a UUID for the repost
    const repostId = uuidv4();

    // Create the repost
    await executeQuery(
      "INSERT INTO reposts (id, post_id, user_id, created_at) VALUES (?, ?, ?, NOW())",
      [repostId, decryptedPostId, userId]
    );

    return NextResponse.json({
      success: true,
      message: "Post reposted successfully",
      repostId: repostId,
    });
  } catch (error) {
    console.error("Error reposting:", error);
    return NextResponse.json(
      { error: "Failed to repost", message: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Remove a repost
export async function DELETE(request, context) {
  try {
    const { params } = context;
    const postId = params.postId;

    // Get the authenticated user
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: "You must be logged in to remove a repost" },
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

    // Check if the user actually reposted this post
    const existingRepost = await executeQuery(
      "SELECT id FROM reposts WHERE post_id = ? AND user_id = ?",
      [decryptedPostId, userId]
    );

    if (existingRepost.length === 0) {
      return NextResponse.json(
        { error: "You haven't reposted this post" },
        { status: 404 }
      );
    }

    // Delete the repost
    await executeQuery(
      "DELETE FROM reposts WHERE post_id = ? AND user_id = ?",
      [decryptedPostId, userId]
    );

    return NextResponse.json({
      success: true,
      message: "Repost removed successfully",
    });
  } catch (error) {
    console.error("Error removing repost:", error);
    return NextResponse.json(
      { error: "Failed to remove repost", message: error.message },
      { status: 500 }
    );
  }
}
