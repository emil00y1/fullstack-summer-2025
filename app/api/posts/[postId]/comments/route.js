// app/api/posts/[postId]/comments/route.js
import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { auth } from "@/auth";

export async function GET(request, { params }) {
  const { postId } = params;
  
  if (!postId) {
    return NextResponse.json({ error: "Missing post ID" }, { status: 400 });
  }
  
  try {
    const comments = await executeQuery(
      `SELECT 
        c.id, 
        c.content as body, 
        c.created_at, 
        c.user_id,
        c.post_id,
        u.username,
        u.email,
        (SELECT COUNT(*) FROM likes WHERE post_id = c.id) as like_count
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at DESC`,
      [postId]
    );
    
    // Format comments for client use
    const formattedComments = comments.map(comment => ({
      id: comment.id,
      body: comment.body,
      createdAt: comment.created_at,
      userId: comment.user_id,
      postId: comment.post_id,
      likesCount: comment.like_count || 0,
      user: {
        id: comment.user_id,
        username: comment.username,
        name: comment.username, // Use username as name
        email: comment.email,
        image: null // No image in your schema
      },
      likes: []
    }));
    
    return NextResponse.json({ comments: formattedComments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" }, 
      { status: 500 }
    );
  }
}

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
    const data = await request.json();
    
    if (!data.content && !data.body) {
      return NextResponse.json({ error: "Comment content is required" }, { status: 400 });
    }
    
    // Support both content and body properties
    const commentContent = data.content || data.body;
    
    // Check if post exists
    const post = await executeQuery(
      "SELECT id FROM posts WHERE id = ?",
      [postId]
    );
    
    if (post.length === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    
    // Insert the comment - using 'content' field name from your schema
    const result = await executeQuery(
      "INSERT INTO comments (content, user_id, post_id, created_at) VALUES (?, ?, ?, NOW())",
      [commentContent, session.user.id, postId]
    );
    
    // Get the new comment with user info
    const newComment = await executeQuery(
      `SELECT 
        c.id, 
        c.content as body, 
        c.created_at, 
        c.user_id,
        c.post_id,
        u.username,
        u.email
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?`,
      [result.insertId]
    );
    
    if (newComment.length === 0) {
      return NextResponse.json({ error: "Failed to retrieve new comment" }, { status: 500 });
    }
    
    // Format the new comment for client
    const formattedComment = {
      id: newComment[0].id,
      body: newComment[0].body,
      createdAt: newComment[0].created_at,
      userId: newComment[0].user_id,
      postId: newComment[0].post_id,
      likesCount: 0,
      user: {
        id: newComment[0].user_id,
        username: newComment[0].username,
        name: newComment[0].username, // Use username as name
        email: newComment[0].email,
        image: null // No image in your schema
      },
      likes: []
    };
    
    return NextResponse.json(formattedComment);
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment", details: error.message }, 
      { status: 500 }
    );
  }
}