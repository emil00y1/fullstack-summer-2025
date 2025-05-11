import { executeQuery } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { users: [], posts: [] },
        { status: 200 }
      );
    }

    // Format the search term for SQL LIKE statement
    const searchTerm = `%${query}%`;

    // Search for users
    const users = await executeQuery(
      `SELECT 
        id, 
        username, 
        email, 
        avatar 
      FROM users 
      WHERE username LIKE ?
      LIMIT 5`,
      [searchTerm, searchTerm]
    );

    // Search for public posts
    const posts = await executeQuery(
      `SELECT 
        p.id, 
        p.content, 
        p.created_at,
        u.username,
        u.avatar
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.content LIKE ? AND p.is_public = 1
      ORDER BY p.created_at DESC
      LIMIT 5`,
      [searchTerm]
    );

    return NextResponse.json({ users, posts }, { status: 200 });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Error performing search" },
      { status: 500 }
    );
  }
}