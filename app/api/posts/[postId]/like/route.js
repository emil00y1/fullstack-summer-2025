// app/api/posts/[postId]/like/route.js
import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

export async function POST(request, { params }) {
  const postId = params.postId;
  const { userId } = await request.json();

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    // Check if like already exists
    const existingLikes = await executeQuery(
      "SELECT id FROM likes WHERE post_id = ? AND user_id = ?",
      [postId, userId]
    );

    if (existingLikes.length > 0) {
      // Unlike - remove the like
      await executeQuery(
        "DELETE FROM likes WHERE post_id = ? AND user_id = ?",
        [postId, userId]
      );

      // Get updated like count
      const [{ count }] = await executeQuery(
        "SELECT COUNT(*) as count FROM likes WHERE post_id = ?",
        [postId]
      );

      return NextResponse.json({
        liked: false,
        likeCount: count,
      });
    } else {
      // Like - add new like
      await executeQuery("INSERT INTO likes (post_id, user_id) VALUES (?, ?)", [
        postId,
        userId,
      ]);

      // Get updated like count
      const [{ count }] = await executeQuery(
        "SELECT COUNT(*) as count FROM likes WHERE post_id = ?",
        [postId]
      );

      return NextResponse.json({
        liked: true,
        likeCount: count,
      });
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json(
      { error: "Failed to toggle like", message: error.message },
      { status: 500 }
    );
  }
}
