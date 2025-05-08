// app/api/posts/[postId]/like/route.js
import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { auth } from "@/auth";

export async function POST(request, { params }) {
  const postId = params.postId;

  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    console.log("Session:", session);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  console.log("postId:", postId);
  console.log("userId:", userId);

  try {
    // Check if like already exists
    const existingLikes = await executeQuery(
      "SELECT id FROM likes WHERE post_id = ? AND user_id = ?",
      [postId, userId]
    );

    console.log("existingLikes:", existingLikes);

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
