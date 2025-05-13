// app/api/posts/[encryptedId]/privacy/route.js
import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { auth } from "@/auth";
import { decryptId } from "@/utils/cryptoUtils";

export async function PATCH(request, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId } = params;
    const decryptedPostId = decryptId(postId);

    const { isPublic } = await request.json();

    // Check if the user owns this post
    const checkOwnerQuery = `SELECT user_id FROM posts WHERE id = ?`;
    const ownerResult = await executeQuery(checkOwnerQuery, [decryptedPostId]);

    if (ownerResult.length === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (ownerResult[0].user_id !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized - You can only update your own posts" },
        { status: 403 }
      );
    }

    // Update the post privacy
    const updateQuery = `UPDATE posts SET is_public = ? WHERE id = ?`;
    await executeQuery(updateQuery, [isPublic ? 1 : 0, decryptedPostId]);

    return NextResponse.json({
      success: true,
      message: "Post privacy updated successfully",
    });
  } catch (error) {
    console.error("Error updating post privacy:", error);
    return NextResponse.json(
      { error: "Failed to update post privacy", message: error.message },
      { status: 500 }
    );
  }
}
