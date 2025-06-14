// app/api/search/route.js
import { executeQuery } from "@/lib/db";
import { NextResponse } from "next/server";
import { encryptId } from "@/utils/cryptoUtils";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { users: [], posts: [], hashtags: [] },
        { status: 200 }
      );
    }

    const searchTerm = query.trim();
    const isHashtagSearch = searchTerm.startsWith("#");

    let users = [];
    let posts = [];
    let hashtags = [];

    if (isHashtagSearch) {
      // Hashtag search
      const hashtagName = searchTerm.substring(1).toLowerCase();

      // Search for hashtags
      hashtags = await executeQuery(
        `SELECT name, 
         (SELECT COUNT(*) FROM post_hashtags ph WHERE ph.hashtag_id = h.id) as post_count
         FROM hashtags h
         WHERE h.name LIKE ?
         ORDER BY post_count DESC
         LIMIT 10`,
        [`%${hashtagName}%`]
      );

      // Search for posts with this hashtag
      posts = await executeQuery(
        `SELECT DISTINCT
          p.id, 
          p.content, 
          p.created_at,
          u.username,
          u.avatar
        FROM posts p
        JOIN users u ON p.user_id = u.id
        JOIN post_hashtags ph ON p.id = ph.post_id
        JOIN hashtags h ON ph.hashtag_id = h.id
        WHERE h.name LIKE ? AND p.is_public = 1
        ORDER BY p.created_at DESC
        LIMIT 10`,
        [`%${hashtagName}%`]
      );

      // Add encrypted IDs to posts
      posts = posts.map((post) => ({
        ...post,
        id: encryptId(post.id),
      }));

      // Format hashtags for response
      hashtags = hashtags.map((hashtag) => ({
        name: `#${hashtag.name}`,
        postCount: hashtag.post_count,
      }));
    } else {
      // Regular search (users and posts)
      const searchPattern = `%${searchTerm}%`;

      // Search for users
      users = await executeQuery(
        `SELECT username, avatar 
         FROM users 
         WHERE username LIKE ? AND deleted_at IS NULL
         LIMIT 5`,
        [searchPattern]
      );

      // Search for public posts
      posts = await executeQuery(
        `SELECT 
          p.id, 
          p.content, 
          p.created_at,
          u.username,
          u.avatar
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.content LIKE ? AND p.is_public = 1 AND u.deleted_at IS NULL
        ORDER BY p.created_at DESC
        LIMIT 5`,
        [searchPattern]
      );

      // Add encrypted IDs to posts
      posts = posts.map((post) => ({
        ...post,
        id: encryptId(post.id),
      }));

      // Also search for hashtags that match
      hashtags = await executeQuery(
        `SELECT name,
         (SELECT COUNT(*) FROM post_hashtags ph WHERE ph.hashtag_id = h.id) as post_count
         FROM hashtags h
         WHERE h.name LIKE ?
         ORDER BY post_count DESC
         LIMIT 3`,
        [searchPattern]
      );

      hashtags = hashtags.map((hashtag) => ({
        name: `#${hashtag.name}`,
        postCount: hashtag.post_count,
      }));
    }

    return NextResponse.json(
      {
        users,
        posts,
        hashtags,
        searchType: isHashtagSearch ? "hashtag" : "general",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Error performing search" },
      { status: 500 }
    );
  }
}
