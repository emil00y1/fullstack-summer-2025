// app/api/posts/route.js
import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

export async function GET(request) {
  // Get query parameters
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || 10);
  const offset = parseInt(searchParams.get("offset") || 0);

  try {
    // Query for posts with user info
     const query = `
      SELECT 
        p.id, 
        p.content, 
        p.created_at, 
        p.is_public,
        u.id as user_id, 
        u.username,
        u.email,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.is_public = 1
      ORDER BY p.created_at DESC 
      LIMIT ? OFFSET ?
    `;

    // Pass parameters as array - order matters!
    const posts = await executeQuery(query, [limit, offset]);

    // Important: Make sure these are actual numbers, not strings
    const queryParams = [Number(limit), Number(offset)];

    // Debugging
    console.log("Query params:", queryParams);

    // const posts = await executeQuery(query, queryParams);

    // Return the posts
    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts", message: error.message },
      { status: 500 }
    );
  }
}
