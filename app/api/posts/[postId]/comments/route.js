// app/api/posts/[postId]/comments/route.js
import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { auth } from "@/auth";

// Create a comment
export async function POST(request, { params }) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { postId } = params;
    
    if (!postId) {
      return NextResponse.json({ error: "Missing post ID" }, { status: 400 });
    }
    
    // Parse request body
    const { body } = await request.json();
    
    if (!body || typeof body !== 'string' || body.trim() === '') {
      return NextResponse.json({ error: "Comment body is required" }, { status: 400 });
    }
    
    // Check if post exists
    const post = await executeQuery(
      "SELECT id FROM posts WHERE id = ?",
      [postId]
    );
    
    if (post.length === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    
    // Create the comment
    const result = await executeQuery(
      `INSERT INTO comments (body, user_id, post_id, created_at) 
       VALUES (?, ?, ?, NOW())`,
      [body, session.user.id, postId]
    );
    
    // Get the newly created comment
    const newComment = await executeQuery(
      `SELECT c.id, c.body, c.created_at AS createdAt, c.user_id AS userId, c.post_id AS postId
       FROM comments c
       WHERE c.id = ?`,
      [result.insertId]
    );
    
    if (newComment.length === 0) {
      return NextResponse.json({ error: "Failed to retrieve new comment" }, { status: 500 });
    }
    
    return NextResponse.json({
      ...newComment[0],
      likesCount: 0,
      likes: []
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}