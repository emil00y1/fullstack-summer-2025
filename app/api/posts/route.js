import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { auth } from "@/auth";
import { encryptId } from "@/utils/cryptoUtils";
import { v4 as uuidv4 } from "uuid";

export async function GET(request) {
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
    const postsWithEncryptedIds = posts.map((post) => ({
      ...post,
      encryptedId: encryptId(post.id),
      user: {
        username: post.username,
        avatar: post.avatar,
      },
      id: undefined,
      user_id: undefined,
      email: undefined,
    }));
    return NextResponse.json(postsWithEncryptedIds);
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
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized - You must be logged in to create a post" },
        { status: 401 }
      );
    }

    const data = await request.json();

    if (!data.content) {
      return NextResponse.json(
        { error: "Missing required content" },
        { status: 400 }
      );
    }

    const userId = session.user.id;
    const postId = uuidv4();

    const query = `
      INSERT INTO posts (id, content, user_id, is_public, created_at) 
      VALUES (?, ?, ?, ?, NOW())
    `;

    await executeQuery(query, [postId, data.content, userId, 1]);

    return NextResponse.json({
      success: true,
      message: "Post created successfully",
      encryptedId: encryptId(postId),
    });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Failed to create post", message: error.message },
      { status: 500 }
    );
  }
}
