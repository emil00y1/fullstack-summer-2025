// app/api/users/by-username/[username]/route.js
import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

export async function GET(request, { params }) {
  try {
    const { username } = params;
    
    if (!username || typeof username !== 'string') {
      return NextResponse.json({ error: 'Invalid username' }, { status: 400 });
    }
    
    // Fetch user by username
    const users = await executeQuery(
      `SELECT id, name, email, image, username, bio, location, website,
       created_at AS createdAt, cover_image AS coverImage
       FROM users 
       WHERE username = ?`,
      [username]
    );
    
    if (users.length === 0) {
      return NextResponse.json({ error: `User with username "${username}" not found` }, { status: 404 });
    }
    const user = users[0];

    // Fetch user's posts
    const posts = await executeQuery(
      `SELECT id, body, created_at AS createdAt, likes_count AS likesCount, comments_count AS commentsCount
       FROM posts
       WHERE user_id = ?`,
      [user.id]
    );

    // Fetch user's comments
    const comments = await executeQuery(
      `SELECT id, body, created_at AS createdAt, likes_count AS likesCount, post_id AS postId
       FROM comments
       WHERE user_id = ?`,
      [user.id]
    );

    // Combine user data, posts, and comments into a single response
    const userData = {
      ...user,
      posts: posts,
      comments: comments,
    };

    return NextResponse.json(userData);
  } catch (error) {
    console.error("Error fetching user by username:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
