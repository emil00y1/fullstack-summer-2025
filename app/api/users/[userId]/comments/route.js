// app/api/users/[userId]/comments/route.js
import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

export async function GET(request, { params }) {
  try {
    const { userId } = params;
    
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });
    }
    
    // Get query parameters for pagination if needed
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Fetch comments by user
    const comments = await executeQuery(
      `SELECT c.id, c.body, c.created_at AS createdAt, c.user_id AS userId, 
       c.post_id AS postId
       FROM comments c
       WHERE c.user_id = ?
       ORDER BY c.created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );
    
    // Fetch additional data for each comment
    const commentsWithData = await Promise.all(comments.map(async (comment) => {
      // Get user info
      const userInfo = await executeQuery(
        `SELECT id, name, username, email, image FROM users WHERE id = ?`,
        [comment.userId]
      );
      
      // Get post info and its author
      const postInfo = await executeQuery(
        `SELECT p.id, p.body, p.user_id AS userId, u.name, u.username, u.email 
         FROM posts p
         JOIN users u ON p.user_id = u.id
         WHERE p.id = ?`,
        [comment.postId]
      );
      
      // Get likes count
      const likesCount = await executeQuery(
        `SELECT COUNT(*) AS count FROM comment_likes WHERE comment_id = ?`,
        [comment.id]
      );
      
      // Get likes user IDs
      const likes = await executeQuery(
        `SELECT user_id AS userId FROM comment_likes WHERE comment_id = ?`,
        [comment.id]
      );
      
      // Return formatted comment
      return {
        ...comment,
        user: userInfo[0],
        post: postInfo.length > 0 ? {
          id: postInfo[0].id,
          body: postInfo[0].body,
          user: {
            id: postInfo[0].userId,
            name: postInfo[0].name,
            username: postInfo[0].username,
            email: postInfo[0].email
          }
        } : null,
        likesCount: likesCount[0].count,
        likes: likes.map(like => like.userId)
      };
    }));
    
    return NextResponse.json({ comments: commentsWithData });
  } catch (error) {
    console.error("Error fetching user comments:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}