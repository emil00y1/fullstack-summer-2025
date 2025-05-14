// app/api/posts/route.js
import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { auth } from "@/auth";
import { encryptId } from "@/utils/cryptoUtils";
import { v4 as uuidv4 } from "uuid";
import { fetchPostsWithLikes } from "@/lib/postUtils";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || 10);
  const offset = parseInt(searchParams.get("offset") || 0);
  const username = searchParams.get("username");

  try {
    const session = await auth();
    const currentUserId = session?.user?.id;

    // Use the reusable function to fetch posts with likes
    const posts = await fetchPostsWithLikes(
      {
        limit,
        offset,
        username,
        publicOnly:
          !username ||
          (await getUserIdFromUsername(username)) !== currentUserId,
      },
      currentUserId
    );

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts", message: error.message },
      { status: 500 }
    );
  }
}

async function getUserIdFromUsername(username) {
  const query = `SELECT id FROM users WHERE username = ?`;
  const results = await executeQuery(query, [username]);
  return results.length > 0 ? results[0].id : null;
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
    const isPublic = data.isPublic !== undefined ? data.isPublic : true;

    const query = `
      INSERT INTO posts (id, content, user_id, is_public, created_at) 
      VALUES (?, ?, ?, ?, NOW())
    `;

    await executeQuery(query, [postId, data.content, userId, isPublic ? 1 : 0]);

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
