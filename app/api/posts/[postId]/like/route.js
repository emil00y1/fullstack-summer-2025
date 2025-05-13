import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { auth } from "@/auth";
import { decryptId } from "@/utils/cryptoUtils";

export async function POST(request, { params }) {
  const { postId: encryptedPostId } = params;

  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    console.log("Session:", session);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let postId;
  try {
    postId = decryptId(encryptedPostId);
  } catch (error) {
    return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
  }

  const userId = session.user.id;

  try {
    const existingLikes = await executeQuery(
      "SELECT id FROM likes WHERE post_id = ? AND user_id = ?",
      [postId, userId]
    );

    if (existingLikes.length > 0) {
      await executeQuery(
        "DELETE FROM likes WHERE post_id = ? AND user_id = ?",
        [postId, userId]
      );

      const [{ count }] = await executeQuery(
        "SELECT COUNT(*) as count FROM likes WHERE post_id = ?",
        [postId]
      );

      return NextResponse.json({
        liked: false,
        likeCount: count,
      });
    } else {
      await executeQuery("INSERT INTO likes (post_id, user_id) VALUES (?, ?)", [
        postId,
        userId,
      ]);

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
