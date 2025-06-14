// lib/postUtils.js
import { executeQuery } from "@/lib/db";
import { encryptId } from "@/utils/cryptoUtils";

export async function fetchPostWithLikes(postId, userId = null) {
  try {
    // Fetch post with user details and like/repost counts
    const posts = await executeQuery(
      `
      SELECT 
        p.id, 
        p.content as body, 
        p.created_at as createdAt,
        p.is_public as isPublic,
        u.username, 
        u.avatar,
        COUNT(DISTINCT l.id) as likesCount,
        COUNT(DISTINCT c.id) as commentsCount,
        COUNT(DISTINCT r.id) as repostsCount,
        GROUP_CONCAT(DISTINCT l.user_id) as likeUserIds,
        GROUP_CONCAT(DISTINCT r.user_id) as repostUserIds
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN likes l ON p.id = l.post_id
      LEFT JOIN comments c ON p.id = c.post_id
      LEFT JOIN reposts r ON p.id = r.post_id
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
    const repostUserIds = post.repostUserIds
      ? post.repostUserIds.split(",")
      : [];

    return {
      ...post,
      encryptedId: encryptId(post.id),
      likes: likeUserIds,
      isLiked: userId ? likeUserIds.includes(userId) : false,
      reposts: repostUserIds,
      isReposted: userId ? repostUserIds.includes(userId) : false,
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

    // Modified query to include reposts in the feed
    let query = `
      SELECT 
        p.id, 
        p.content as body, 
        p.created_at as createdAt, 
        p.created_at as originalCreatedAt,
        p.is_public as isPublic,
        p.user_id as originalUserId,
        u.username as originalUsername,
        u.avatar as originalAvatar,
        COUNT(DISTINCT l.id) as likesCount,
        COUNT(DISTINCT c.id) as commentsCount,
        COUNT(DISTINCT r.id) as repostsCount,
        GROUP_CONCAT(DISTINCT l.user_id) as likeUserIds,
        GROUP_CONCAT(DISTINCT r.user_id) as repostUserIds,
        NULL as repostedBy,
        NULL as repostedAt,
        'post' as type
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN likes l ON p.id = l.post_id
      LEFT JOIN comments c ON p.id = c.post_id
      LEFT JOIN reposts r ON p.id = r.post_id
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

    query += ` GROUP BY p.id`;

    // Add reposts to the feed (only for general feed, not user profiles)
    if (!username) {
      query += `
        UNION ALL
        SELECT 
          p.id, 
          p.content as body, 
          rp.created_at as createdAt, 
          p.created_at as originalCreatedAt,
          p.is_public as isPublic,
          p.user_id as originalUserId,
          u.username as originalUsername,
          u.avatar as originalAvatar,
          COUNT(DISTINCT l.id) as likesCount,
          COUNT(DISTINCT c.id) as commentsCount,
          COUNT(DISTINCT r.id) as repostsCount,
          GROUP_CONCAT(DISTINCT l.user_id) as likeUserIds,
          GROUP_CONCAT(DISTINCT r.user_id) as repostUserIds,
          ru.username as repostedBy,
          rp.created_at as repostedAt,
          'repost' as type
        FROM reposts rp
        JOIN posts p ON rp.post_id = p.id
        JOIN users u ON p.user_id = u.id
        JOIN users ru ON rp.user_id = ru.id
        LEFT JOIN likes l ON p.id = l.post_id
        LEFT JOIN comments c ON p.id = c.post_id
        LEFT JOIN reposts r ON p.id = r.post_id
        WHERE p.is_public = 1
        GROUP BY p.id, rp.id
      `;
    }

    query += ` ORDER BY createdAt DESC LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);

    const posts = await executeQuery(query, queryParams);

    return posts.map((post) => {
      const likeUserIds = post.likeUserIds ? post.likeUserIds.split(",") : [];
      const repostUserIds = post.repostUserIds
        ? post.repostUserIds.split(",")
        : [];

      return {
        ...post,
        encryptedId: encryptId(post.id),
        likes: likeUserIds,
        isLiked: userId ? likeUserIds.includes(userId) : false,
        reposts: repostUserIds,
        isReposted: userId ? repostUserIds.includes(userId) : false,
        user: {
          id: post.originalUserId,
          username: post.originalUsername,
          avatar: post.originalAvatar,
        },
        // Repost-specific data
        isRepost: post.type === "repost",
        repostedBy: post.repostedBy,
        repostedAt: post.repostedAt,
        originalCreatedAt: post.originalCreatedAt,
      };
    });
  } catch (error) {
    console.error("Error fetching posts with likes:", error);
    throw error;
  }
}

export async function fetchUserReposts(username, userId = null) {
  try {
    const reposts = await executeQuery(
      `
      SELECT 
        p.id, 
        p.content as body, 
        rp.created_at as createdAt,
        p.created_at as originalCreatedAt,
        p.is_public as isPublic,
        p.user_id as originalUserId,
        u.username as originalUsername,
        u.avatar as originalAvatar,
        ru.username as repostedBy,
        rp.created_at as repostedAt,
        COUNT(DISTINCT l.id) as likesCount,
        COUNT(DISTINCT c.id) as commentsCount,
        COUNT(DISTINCT r.id) as repostsCount,
        GROUP_CONCAT(DISTINCT l.user_id) as likeUserIds,
        GROUP_CONCAT(DISTINCT r.user_id) as repostUserIds
      FROM reposts rp
      JOIN posts p ON rp.post_id = p.id
      JOIN users u ON p.user_id = u.id
      JOIN users ru ON rp.user_id = ru.id
      LEFT JOIN likes l ON p.id = l.post_id
      LEFT JOIN comments c ON p.id = c.post_id
      LEFT JOIN reposts r ON p.id = r.post_id
      WHERE ru.username = ? AND p.is_public = 1
      GROUP BY p.id, rp.id
      ORDER BY rp.created_at DESC
    `,
      [username]
    );

    return reposts.map((post) => {
      const likeUserIds = post.likeUserIds ? post.likeUserIds.split(",") : [];
      const repostUserIds = post.repostUserIds
        ? post.repostUserIds.split(",")
        : [];

      return {
        ...post,
        encryptedId: encryptId(post.id),
        likes: likeUserIds,
        isLiked: userId ? likeUserIds.includes(userId) : false,
        reposts: repostUserIds,
        isReposted: userId ? repostUserIds.includes(userId) : false,
        user: {
          id: post.originalUserId,
          username: post.originalUsername,
          avatar: post.originalAvatar,
        },
        // Mark as repost
        isRepost: true,
        repostedBy: post.repostedBy,
        repostedAt: post.repostedAt,
        originalCreatedAt: post.originalCreatedAt,
      };
    });
  } catch (error) {
    console.error("Error fetching user reposts:", error);
    throw error;
  }
}
