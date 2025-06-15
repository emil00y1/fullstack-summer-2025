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
      // Hashtag search - search within post content
      const hashtagName = searchTerm.toLowerCase();

      // Search for posts containing this hashtag in content
      const hashtagPosts = await executeQuery(
        `SELECT 
          p.id, 
          p.content, 
          p.created_at,
          p.is_public,
          u.username,
          u.avatar,
          (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
          (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.content LIKE ? AND p.is_public = 1 AND u.deleted_at IS NULL
        ORDER BY p.created_at DESC`,
        [`%${hashtagName}%`]
      );

      // Format posts for PostItem component
      posts = hashtagPosts.map((post) => ({
        id: post.id,
        encryptedId: encryptId(post.id),
        body: post.content,
        createdAt: post.created_at,
        likesCount: post.like_count || 0,
        commentsCount: post.comment_count || 0,
        repostsCount: 0,
        isPublic: Boolean(post.is_public),
        isLiked: false,
        isRepost: false,
        user: {
          username: post.username,
          avatar: post.avatar,
          name: post.username,
        },
        comments: [],
      }));

      // Extract hashtags from all public posts for suggestion
      const allPosts = await executeQuery(
        `SELECT content FROM posts WHERE is_public = 1`
      );

      const hashtagCounts = {};
      allPosts.forEach((post) => {
        const hashtagMatches = post.content.match(/#\w+/g);
        if (hashtagMatches) {
          hashtagMatches.forEach((tag) => {
            const normalizedTag = tag.toLowerCase();
            if (normalizedTag.includes(hashtagName.substring(1))) {
              hashtagCounts[normalizedTag] =
                (hashtagCounts[normalizedTag] || 0) + 1;
            }
          });
        }
      });

      hashtags = Object.entries(hashtagCounts)
        .map(([name, count]) => ({ name, postCount: count }))
        .sort((a, b) => b.postCount - a.postCount);
    } else {
      // Regular search (users and posts) - removed limits
      const searchPattern = `%${searchTerm}%`;

      // Search for users - no limit
      users = await executeQuery(
        `SELECT username, avatar 
         FROM users 
         WHERE username LIKE ? AND deleted_at IS NULL
         ORDER BY username`,
        [searchPattern]
      );

      // Search for public posts - no limit
      const regularPosts = await executeQuery(
        `SELECT 
          p.id, 
          p.content, 
          p.created_at,
          p.is_public,
          u.username,
          u.avatar,
          (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
          (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.content LIKE ? AND p.is_public = 1 AND u.deleted_at IS NULL
        ORDER BY p.created_at DESC`,
        [searchPattern]
      );

      // Format posts for PostItem component
      posts = regularPosts.map((post) => ({
        id: post.id,
        encryptedId: encryptId(post.id),
        body: post.content,
        createdAt: post.created_at,
        likesCount: post.like_count || 0,
        commentsCount: post.comment_count || 0,
        repostsCount: 0,
        isPublic: Boolean(post.is_public),
        isLiked: false,
        isRepost: false,
        user: {
          username: post.username,
          avatar: post.avatar,
          name: post.username,
        },
        comments: [],
      }));

      // Search for hashtags in post content
      const allPosts = await executeQuery(
        `SELECT content FROM posts WHERE is_public = 1 AND content LIKE ?`,
        [searchPattern]
      );

      const hashtagCounts = {};
      allPosts.forEach((post) => {
        const hashtagMatches = post.content.match(/#\w+/g);
        if (hashtagMatches) {
          hashtagMatches.forEach((tag) => {
            const normalizedTag = tag.toLowerCase();
            if (normalizedTag.includes(searchTerm.toLowerCase())) {
              hashtagCounts[normalizedTag] =
                (hashtagCounts[normalizedTag] || 0) + 1;
            }
          });
        }
      });

      hashtags = Object.entries(hashtagCounts)
        .map(([name, count]) => ({ name, postCount: count }))
        .sort((a, b) => b.postCount - a.postCount)
        .slice(0, 10); // Limit hashtag suggestions to 10
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
