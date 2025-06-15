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
        'post' as type,
        NULL as repostId,
        p.id as originalPostId
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN likes l ON p.id = l.post_id
      LEFT JOIN comments c ON p.id = c.post_id
      LEFT JOIN reposts r ON p.id = r.post_id
      WHERE 1=1
    `;

    const queryParams = [];

    if (username) {
      query += ` AND u.username = ?`;
      queryParams.push(username);

      if (publicOnly) {
        query += ` AND (p.is_public = 1 OR u.id = ?)`;
        queryParams.push(userId || "");
      }
    } else if (publicOnly) {
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
          'repost' as type,
          rp.id as repostId,
          p.id as originalPostId
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

      // Create a truly unique identifier combining original post and repost info
      const uniqueId =
        post.type === "repost" && post.repostId
          ? `${post.id}-repost-${post.repostId}`
          : post.id;

      return {
        ...post,
        encryptedId: encryptId(post.id),
        uniqueKey: encryptId(uniqueId), // This will now be unique for each repost
        likes: likeUserIds,
        isLiked: userId ? likeUserIds.includes(userId) : false,
        reposts: repostUserIds,
        isReposted: userId ? repostUserIds.includes(userId) : false,
        user: {
          id: post.originalUserId,
          username: post.originalUsername,
          avatar: post.originalAvatar,
        },
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

export async function getTrendingHashtags(limit = 10) {
  try {
    // Get trending hashtags based on recent usage (last 7 days)
    const query = `
      SELECT 
        h.name,
        COUNT(ph.post_id) as post_count,
        COUNT(DISTINCT ph.post_id) as unique_posts
      FROM hashtags h
      JOIN post_hashtags ph ON h.id = ph.hashtag_id
      JOIN posts p ON ph.post_id = p.id
      WHERE p.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        AND p.is_public = 1
      GROUP BY h.id, h.name
      ORDER BY post_count DESC, unique_posts DESC
      LIMIT ?
    `;

    const results = await executeQuery(query, [limit]);

    return results.map((row) => ({
      hashtag: `#${row.name}`,
      posts: row.post_count.toString(),
      category: getCategoryForHashtag(row.name),
    }));
  } catch (error) {
    console.error("Error fetching trending hashtags:", error);
    return [];
  }
}

function getCategoryForHashtag(hashtag) {
  // Simple categorization based on hashtag name
  const categories = {
    tech: [
      "javascript",
      "react",
      "nextjs",
      "typescript",
      "nodejs",
      "webdev",
      "coding",
      "programming",
      "frontend",
      "backend",
      "fullstack",
    ],
    ai: ["ai", "machinelearning", "ml", "deeplearning", "neural", "python"],
    design: ["design", "ui", "ux", "css", "html", "graphics", "creative"],
    business: ["startup", "entrepreneur", "business", "marketing", "growth"],
    lifestyle: ["motivation", "productivity", "learning", "career", "tips"],
  };

  for (const [category, tags] of Object.entries(categories)) {
    if (tags.includes(hashtag.toLowerCase())) {
      return category.charAt(0).toUpperCase() + category.slice(1);
    }
  }

  return "General";
}
