// app/api/posts/[postId]/comments/route.js
import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

export async function GET(request, { params }) {
  const postId = params.postId;

  try {
    // Query to get comments with user info
    const query = `
      SELECT 
        c.id,
        c.content,
        c.created_at,
        u.id as user_id,
        u.username
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at DESC
    `;

    // Execute the query using db.js
    const comments = await executeQuery(query, [postId]);

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments", message: error.message },
      { status: 500 }
    );
  }
}
