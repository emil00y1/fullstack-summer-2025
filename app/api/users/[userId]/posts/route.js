// app/api/users/[userId]/posts/route.js
import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { decryptId, encryptId } from "@/utils/cryptoUtils";

export async function GET(request, { params }) {
  try {
    const { userId } = params;

    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
    }

    // Get query parameters for pagination
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Fetch posts by user
    const posts = await executeQuery(
      `SELECT p.id, p.body, p.image, p.created_at AS createdAt, p.user_id AS userId
       FROM posts p
       WHERE p.user_id = ?
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );

    // Fetch user info for each post and add encrypted IDs
    const postsWithUserInfo = await Promise.all(
      posts.map(async (post) => {
        // Encrypt the post ID
        const encryptedPostId = encryptId(post.id);

        // Get user info
        const userInfo = await executeQuery(
          `SELECT id, name, username, email, image FROM users WHERE id = ?`,
          [post.userId]
        );

        // Get comments count
        const commentsCount = await executeQuery(
          `SELECT COUNT(*) AS count FROM comments WHERE post_id = ?`,
          [post.id]
        );

        // Get likes count
        const likesCount = await executeQuery(
          `SELECT COUNT(*) AS count FROM post_likes WHERE post_id = ?`,
          [post.id]
        );

        // Get likes user IDs
        const likes = await executeQuery(
          `SELECT user_id AS userId FROM post_likes WHERE post_id = ?`,
          [post.id]
        );

        // Get top 3 comments
        const comments = await executeQuery(
          `SELECT c.id, c.body, c.created_at AS createdAt, c.user_id AS userId, 
         c.post_id AS postId, u.name, u.username, u.email, u.image
         FROM comments c
         JOIN users u ON c.user_id = u.id
         WHERE c.post_id = ?
         ORDER BY c.created_at DESC
         LIMIT 3`,
          [post.id]
        );

        // Format comments with encrypted IDs
        const formattedComments = comments.map((comment) => ({
          ...comment,
          id: encryptId(comment.id),
          user: {
            id: comment.userId,
            name: comment.name,
            username: comment.username,
            email: comment.email,
            image: comment.image,
          },
          // Remove redundant fields
          name: undefined,
          username: undefined,
          email: undefined,
          image: undefined,
        }));

        // Return formatted post with encrypted ID
        return {
          ...post,
          id: encryptedPostId, // Replace original ID with encrypted version
          user: userInfo[0],
          commentsCount: commentsCount[0].count,
          likesCount: likesCount[0].count,
          comments: formattedComments,
          likes: likes.map((like) => like.userId),
        };
      })
    );

    return NextResponse.json({ posts: postsWithUserInfo });
  } catch (error) {
    console.error("Error fetching user posts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
