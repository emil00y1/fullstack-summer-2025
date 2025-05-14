// lib/postUtils.js
import { executeQuery } from "@/lib/db";
import { encryptId } from "@/utils/cryptoUtils";

export async function fetchPostWithLikes(postId, userId = null) {
  try {
    // Fetch post with user details and like counts
    const posts = await executeQuery(
      `
      SELECT 
        p.id, 
        p.content as body, 
        p.created_at as createdAt,
        p.is_public as isPublic,
        u.id as userId, 
        u.username, 
        u.avatar,
        COUNT(DISTINCT l.id) as likesCount,
        COUNT(DISTINCT c.id) as commentsCount,
        GROUP_CONCAT(DISTINCT l.user_id) as likeUserIds
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN likes l ON p.id = l.post_id
      LEFT JOIN comments c ON p.id = c.post_id
      WHERE p.id = ?
      GROUP BY p.id
    `,
      [postId]
    );

    if (posts.length === 0) {
      return null;
    }

    const post = posts[0];
    const likeUserIds = post.likeUserIds ? post.likeUserIds.split(",") : [];

    return {
      ...post,
      encryptedId: encryptId(post.id),
      likes: likeUserIds,
      isLiked: userId ? likeUserIds.includes(userId) : false,
      user: {
        id: post.userId,
        username: post.username,
        avatar: post.avatar,
      },
    };
  } catch (error) {
    console.error("Error fetching post with likes:", error);
    throw error;
  }
}

export async function fetchPostsWithLikes(params = {}, userId = null) {
  try {
    const {
      limit = 10,
      offset = 0,
      username = null,
      publicOnly = true,
    } = params;

    let query = `
      SELECT 
        p.id, 
        p.content as body, 
        p.created_at as createdAt, 
        p.is_public as isPublic,
        u.id as userId, 
        u.username,
        u.avatar,
        COUNT(DISTINCT l.id) as likesCount,
        COUNT(DISTINCT c.id) as commentsCount,
        GROUP_CONCAT(DISTINCT l.user_id) as likeUserIds
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN likes l ON p.id = l.post_id
      LEFT JOIN comments c ON p.id = c.post_id
      WHERE 1=1
    `;

    const queryParams = [];

    // If viewing a specific user's profile
    if (username) {
      query += ` AND u.username = ?`;
      queryParams.push(username);

      // For other users' profiles, only show public posts if required
      if (publicOnly) {
        query += ` AND (p.is_public = 1 OR u.id = ?)`;
        queryParams.push(userId || "");
      }
    } else if (publicOnly) {
      // For general feed, only show public posts
      query += ` AND p.is_public = 1`;
    }

    query += ` GROUP BY p.id ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);

    const posts = await executeQuery(query, queryParams);

    return posts.map((post) => {
      const likeUserIds = post.likeUserIds ? post.likeUserIds.split(",") : [];

      return {
        ...post,
        encryptedId: encryptId(post.id),
        likes: likeUserIds,
        isLiked: userId ? likeUserIds.includes(userId) : false,
        user: {
          id: post.userId,
          username: post.username,
          avatar: post.avatar,
        },
      };
    });
  } catch (error) {
    console.error("Error fetching posts with likes:", error);
    throw error;
  }
}
