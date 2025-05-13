import { notFound } from "next/navigation";
import Link from "next/link";
import { executeQuery } from "@/lib/db";
import { auth } from "@/auth";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileInfo from "@/components/profile/ProfileInfo";
import ClientTabs from "@/components/profile/ClientTabs";

// Simple Base64 encoding for encryptedId (replace with proper encryption in production)
function encryptId(id) {
  return Buffer.from(id.toString()).toString("base64");
}

export default async function UserProfilePage({ params }) {
  const { username } = params;
  if (!username) return notFound();

  // Get current user session
  const session = await auth();
  const currentUserId = session?.user?.id || null;

  try {
    const users = await executeQuery(
      `SELECT id, username, email, avatar, created_at FROM users WHERE username = ?`,
      [username]
    );

    if (!users || users.length === 0) return notFound();

    const userData = users[0];

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
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ? AND p.is_public = 1
      ORDER BY p.created_at DESC`,
      [userData.id]
    );

    const comments = await executeQuery(
      `SELECT c.*, u.username AS post_author, u.avatar, u.email, u.username
       FROM comments c
       JOIN posts p ON c.post_id = p.id
       JOIN users u ON c.user_id = u.id
       WHERE p.user_id = ?
       ORDER BY c.created_at DESC`,
      [userData.id]
    );

    const formattedPosts = posts.map((post) => ({
      encryptedId: encryptId(post.id),
      id: post.id,
      body: post.content,
      createdAt: post.created_at,
      userId: post.user_id,
      likesCount: post.like_count,
      commentsCount: post.comment_count,
      isPublic: post.is_public === 1,
      user: {
        id: post.user_id,
        username: post.username,
        email: post.email,
        avatar: post.avatar,
      },
      comments: [],
      likes: [],
    }));

    const formattedComments = comments.map((comment) => ({
      encryptedId: encryptId(comment.id),
      ...comment,
      user: {
        username: comment.username,
        email: comment.email,
        avatar: comment.avatar,
      },
      post: {
        user: {
          username: comment.post_author,
        },
      },
    }));

    // Check if current user is following this profile (only if user is authenticated)
    let isFollowing = false;
    if (currentUserId) {
      const isFollowingResult = await executeQuery(
        `SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ? LIMIT 1`,
        [currentUserId, userData.id]
      );
      isFollowing = isFollowingResult.length > 0;
    }

    return (
      <div>
        <ProfileHeader
          username={userData.username}
          postsAmount={posts.length}
        />
        <ProfileInfo
          userData={userData}
          isOwnAccount={currentUserId === userData.id}
          isFollowing={isFollowing}
        />
        <ClientTabs posts={formattedPosts} comments={formattedComments} />
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
