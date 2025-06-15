import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { executeQuery } from "@/lib/db";
import { auth } from "@/auth";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileInfo from "@/components/profile/ProfileInfo";
import ClientTabs from "@/components/profile/ClientTabs";
import { encryptId } from "@/utils/cryptoUtils";
import { fetchUserReposts } from "@/lib/postUtils";

export default async function UserProfilePage({ params }) {
  const username = params?.username || "";
  if (!username) return notFound();

  // Get current user session
  const session = await auth();
  const currentUserId = session?.user?.id || null;

  if (currentUserId && session?.user?.username === username) {
    redirect("/profile");
  }

  try {
    // Fetch the user data
    const users = await executeQuery(
      `SELECT id, username, email, avatar, bio, cover, created_at FROM users WHERE username = ?`,
      [username]
    );

    if (!users || users.length === 0) return notFound();

    const userData = users[0];

    console.log("page.jsx - userData:", userData);

    let isAdmin = false;
    if (currentUserId) {
      const adminCheck = await executeQuery(
        `SELECT 1 FROM user_roles ur 
          JOIN roles r ON ur.role_id = r.id 
          WHERE ur.user_id = ? AND r.name = 'admin'
          LIMIT 1`,
        [currentUserId]
      );
      isAdmin = adminCheck.length > 0;
    }

    // Fetch posts with visibility control
    // Only show public posts for other users, show all posts for the profile owner
    const isOwnProfile = currentUserId === userData.id;

    const posts = await executeQuery(
      `SELECT 
        p.id, 
        p.content, 
        p.created_at, 
        p.is_public,
        u.id as user_id,
        u.username,
        u.email,
        u.avatar,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count,
        (SELECT COUNT(*) FROM reposts WHERE post_id = p.id) as repost_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ? ${
        !isOwnProfile && !isAdmin ? "AND p.is_public = 1" : ""
      }
      ORDER BY p.created_at DESC`,
      [userData.id]
    );

    // Fetch user's reposts (only public posts)
    const userReposts = await fetchUserReposts(username, currentUserId);

    // Format original posts
    const formattedPosts = posts.map((post) => ({
      id: post.id,
      encryptedId: encryptId(post.id),
      body: post.content,
      createdAt: post.created_at,
      userId: post.user_id,
      likesCount: post.like_count,
      commentsCount: post.comment_count,
      repostsCount: post.repost_count || 0,
      isPublic: post.is_public === 1,
      isLiked: false,
      user: {
        id: post.user_id,
        username: post.username,
        email: post.email,
        avatar: post.avatar,
      },
      comments: [],
      isRepost: false,
    }));

    // Combine posts and reposts, sort by creation date
    const allPosts = [...formattedPosts, ...userReposts].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    const comments = await executeQuery(
      `SELECT 
         c.id, 
         c.content, 
         c.created_at, 
         c.post_id,
         c.user_id,
         u.username, 
         u.email, 
         u.avatar,
         p.content as post_content,
         pu.username as post_author,
         (SELECT COUNT(*) FROM comment_likes WHERE comment_id = c.id) as like_count
       FROM comments c
       JOIN users u ON c.user_id = u.id
       JOIN posts p ON c.post_id = p.id
       JOIN users pu ON p.user_id = pu.id
       WHERE c.user_id = ? ${
         !isOwnProfile && !isAdmin ? "AND p.is_public = 1" : ""
       }
       ORDER BY c.created_at DESC`,
      [userData.id]
    );

    // Get current user's likes for these posts (if authenticated)
    let userLikes = [];
    if (currentUserId) {
      const postIds = allPosts.map((post) => post.id).filter(Boolean);
      if (postIds.length > 0) {
        const placeholders = postIds.map(() => "?").join(",");
        userLikes = await executeQuery(
          `SELECT post_id FROM likes WHERE user_id = ? AND post_id IN (${placeholders})`,
          [currentUserId, ...postIds]
        );
      }
    }
    const likedPostIds = new Set(userLikes.map((like) => like.post_id));

    let userCommentLikes = [];
    if (currentUserId) {
      userCommentLikes = await executeQuery(
        `SELECT comment_id FROM comment_likes WHERE user_id = ?`,
        [currentUserId]
      );
    }
    const likedCommentIds = new Set(
      userCommentLikes.map((like) => like.comment_id)
    );

    // Update like status for posts
    allPosts.forEach((post) => {
      if (post.id) {
        post.isLiked = likedPostIds.has(post.id);
      }
    });

    // Format comments with encrypted IDs
    const formattedComments = comments.map((comment) => {
      return {
        id: comment.id,
        encryptedId: encryptId(comment.id),
        postId: comment.post_id,
        postEncryptedId: encryptId(comment.post_id),
        body: comment.content,
        createdAt: comment.created_at,
        isLiked: likedCommentIds.has(comment.id),
        likesCount: comment.like_count || 0,
        user: {
          id: comment.user_id,
          username: comment.username,
          email: comment.email,
          avatar: comment.avatar,
        },
        post: {
          id: comment.post_id,
          encryptedId: encryptId(comment.post_id),
          body: comment.post_content,
          user: {
            username: comment.post_author,
          },
        },
      };
    });

    // Check if current user is following this profile (only if user is authenticated)
    let isFollowing = false;
    if (currentUserId) {
      const isFollowingResult = await executeQuery(
        `SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ? LIMIT 1`,
        [currentUserId, userData.id]
      );
      isFollowing = isFollowingResult.length > 0;
    }

    // For each original post, fetch the top 3 most recent comments
    for (const post of formattedPosts) {
      const postComments = await executeQuery(
        `SELECT 
           c.id, 
           c.content, 
           c.created_at, 
           c.user_id,
           u.username, 
           u.email, 
           u.avatar,
           (SELECT COUNT(*) FROM comment_likes WHERE comment_id = c.id) as like_count
         FROM comments c
         JOIN users u ON c.user_id = u.id
         WHERE c.post_id = ?
         ORDER BY c.created_at DESC
         LIMIT 3`,
        [post.id]
      );

      // Get likes for these comments if current user is authenticated
      const commentLikedMap = new Map();
      if (currentUserId && postComments.length > 0) {
        const commentIds = postComments.map((comment) => comment.id);
        const commentLikes = await executeQuery(
          `SELECT comment_id FROM comment_likes WHERE user_id = ? AND comment_id IN (${commentIds
            .map(() => "?")
            .join(",")})`,
          [currentUserId, ...commentIds]
        );

        commentLikes.forEach((like) => {
          commentLikedMap.set(like.comment_id, true);
        });
      }

      // Format and add the comments to the post
      post.comments = postComments.map((comment) => ({
        id: comment.id,
        encryptedId: encryptId(comment.id),
        postId: post.id,
        postEncryptedId: post.encryptedId,
        body: comment.content,
        createdAt: comment.created_at,
        isLiked: commentLikedMap.has(comment.id),
        likesCount: comment.like_count || 0,
        user: {
          id: comment.user_id,
          username: comment.username,
          email: comment.email,
          avatar: comment.avatar,
        },
      }));
    }

    return (
      <div>
        <ProfileHeader
          username={userData.username}
          postsAmount={allPosts.length}
        />
        <ProfileInfo
          userData={userData}
          isOwnAccount={isOwnProfile}
          isFollowing={isFollowing}
        />
        <ClientTabs
          posts={allPosts}
          comments={formattedComments}
          isAdmin={isAdmin}
        />
      </div>
    );
  } catch (error) {
    console.error("Error fetching user data:", error);
    return (
      <div className="max-w-xl mx-auto p-8 text-center">
        <h2 className="text-xl font-bold mb-4">Error</h2>
        <p>Something went wrong while loading user data</p>
        <Link href="/" className="mt-4 inline-block text-blue-500">
          Return to home
        </Link>
      </div>
    );
  }
}
