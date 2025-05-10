// app/api/posts/route.js
import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { auth } from "@/auth";

export async function GET(request) {
  // Your existing GET function remains the same
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || 10);
  const offset = parseInt(searchParams.get("offset") || 0);

  try {
    const query = `
      SELECT 
        p.id, 
        p.content, 
        p.created_at, 
        p.is_public,
        u.id as user_id, 
        u.username,
        u.email,
        u.avatar,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.is_public = 1
      ORDER BY p.created_at DESC 
      LIMIT ? OFFSET ?
    `;

    const posts = await executeQuery(query, [limit, offset]);

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts", message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    // Verify authentication using the auth() function from @/auth
    const session = await auth();
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized - You must be logged in to create a post" },
        { status: 401 }
      );
    }
    
    // Get data from request body
    const data = await request.json();
    
    // Validate required fields
    if (!data.content) {
      return NextResponse.json(
        { error: "Missing required content" },
        { status: 400 }
      );
    }
    
    // Get user ID from session
    const userId = session.user.id;
    
    // Insert into database
    const query = `
      INSERT INTO posts (content, user_id, is_public, created_at) 
      VALUES (?, ?, ?, NOW())
    `;
    
    await executeQuery(query, [
      data.content,
      userId,
      1  // Default to public
    ]);
    
    // Just return a success message without the query result
    return NextResponse.json({ 
      success: true, 
      message: "Post created successfully"
    });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Failed to create post", message: error.message },
      { status: 500 }
    );
  }
}