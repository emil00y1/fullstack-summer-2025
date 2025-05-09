// app/api/posts/[postId]/comments/[commentId]/like/route.js
import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { auth } from "@/auth";

// Like a comment
export async function POST(request, { params }) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { postId, commentId } = params;
    
    if (!postId || !commentId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }
    
    // Check if comment exists
    const comment = await executeQuery(
      "SELECT id FROM comments WHERE id = ?",
      [commentId]
    );
    
    if (comment.length === 0) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }
    
    // Check if like already exists
    const existingLike = await executeQuery(
      "SELECT id FROM comment_likes WHERE user_id = ? AND comment_id = ?",
      [session.user.id, commentId]
    );
    
    // If like already exists, return success
    if (existingLike.length > 0) {
      return NextResponse.json({ success: true, alreadyLiked: true });
    }
    
    // Create the like
    await executeQuery(
      "INSERT INTO comment_likes (user_id, comment_id) VALUES (?, ?)",
      [session.user.id, commentId]
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error liking comment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Unlike a comment
export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { postId, commentId } = params;
    
    if (!postId || !commentId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }
    
    // Delete the like
    await executeQuery(
      "DELETE FROM comment_likes WHERE user_id = ? AND comment_id = ?",
      [session.user.id, commentId]
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error unliking comment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}