// app/api/posts/route.js
import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { auth } from "@/auth";
import { encryptId } from "@/utils/cryptoUtils";
import { v4 as uuidv4 } from "uuid";
import { fetchPostsWithLikes } from "@/lib/postUtils";
import {
  extractHashtags,
  isValidHashtag,
  formatHashtagForStorage,
} from "@/utils/hashtagUtils";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || 10);
  const offset = parseInt(searchParams.get("offset") || 0);
  const username = searchParams.get("username");
  const hashtag = searchParams.get("hashtag");

  try {
    const session = await auth();
    const currentUserId = session?.user?.id;

    // Use the reusable function to fetch posts with likes
    const posts = await fetchPostsWithLikes(
      {
        limit,
        offset,
        username,
        hashtag, // Pass hashtag parameter
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

async function saveHashtags(postId, content) {
  try {
    // Extract hashtags from content
    const hashtags = extractHashtags(content);

    if (hashtags.length === 0) return;

    for (const hashtagName of hashtags) {
      // Validate and format hashtag
      if (!isValidHashtag(hashtagName)) continue;

      const formattedHashtag = formatHashtagForStorage(hashtagName);

      // Check if hashtag exists, if not create it
      let hashtagResult = await executeQuery(
        "SELECT id FROM hashtags WHERE name = ?",
        [formattedHashtag]
      );

      let hashtagId;
      if (hashtagResult.length === 0) {
        // Create new hashtag
        hashtagId = uuidv4();
        await executeQuery("INSERT INTO hashtags (id, name) VALUES (?, ?)", [
          hashtagId,
          formattedHashtag,
        ]);
      } else {
        hashtagId = hashtagResult[0].id;
      }

      // Link post to hashtag (ignore duplicates)
      try {
        await executeQuery(
          "INSERT INTO post_hashtags (post_id, hashtag_id) VALUES (?, ?)",
          [postId, hashtagId]
        );
      } catch (error) {
        // Ignore duplicate key errors
        if (!error.message.includes("Duplicate entry")) {
          console.error("Error linking post to hashtag:", error);
        }
      }
    }
  } catch (error) {
    console.error("Error saving hashtags:", error);
    // Don't throw error here, as post creation should succeed even if hashtag saving fails
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
    const isPublic = data.isPublic !== undefined ? data.isPublic : true;

    // Create the post
    const query = `
      INSERT INTO posts (id, content, user_id, is_public, created_at) 
      VALUES (?, ?, ?, ?, NOW())
    `;

    await executeQuery(query, [postId, data.content, userId, isPublic ? 1 : 0]);

    // Save hashtags asynchronously
    await saveHashtags(postId, data.content);

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
