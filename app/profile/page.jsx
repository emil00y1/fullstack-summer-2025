// app/profile/page.jsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import ClientTabs from "@/components/profile/ClientTabs";
import { executeQuery } from "@/lib/db";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileInfo from "@/components/profile/ProfileInfo";

export default async function ProfilePage() {
  // Get session using auth()
  const session = await auth();

  // Redirect if no session
  if (!session || !session.user) {
    redirect("/login");
  }

  const userId = session.user.id;

  // Fetch user posts directly from the database instead of using API route
  // This ensures we're using the exact same userId from the session
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
    WHERE p.user_id = ?
    ORDER BY p.created_at DESC`,
    [userId]
  );

  // Format posts to match the expected structure
  const formattedPosts = posts.map((post) => ({
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

  // Fetch user comments directly from database
  const comments = await executeQuery(
    `SELECT 
      c.id, 
      c.content as body, 
      c.created_at, 
      c.user_id,
      c.post_id,
      u.username,
      u.email,
      p.content as post_content,
      pu.username as post_username,
      pu.id as post_user_id,
      (SELECT COUNT(*) FROM likes WHERE post_id = c.id) as like_count
    FROM comments c
    JOIN users u ON c.user_id = u.id
    JOIN posts p ON c.post_id = p.id
    JOIN users pu ON p.user_id = pu.id
    WHERE c.user_id = ?
    ORDER BY c.created_at DESC`,
    [userId]
  );

  // Format comments
  const formattedComments = comments.map((comment) => ({
    id: comment.id,
    body: comment.body,
    createdAt: comment.created_at,
    userId: comment.user_id,
    postId: comment.post_id,
    likesCount: comment.like_count || 0,
    user: {
      id: comment.user_id,
      username: comment.username,
      email: comment.email,
      avatar: comment.avatar,
    },
    post: {
      id: comment.post_id,
      body: comment.post_content,
      user: {
        id: comment.post_user_id,
        username: comment.post_username,
      },
    },
    likes: [],
  }));

  // User data from session
  const userData = session.user;

  console.log(userData);

  return (
    <div>
      <ProfileHeader
        username={userData.username}
        postsAmount={formattedPosts.length}
      />

      <ProfileInfo userData={userData} />

      {/* Tabs using client component wrapper */}
      <ClientTabs posts={formattedPosts} comments={formattedComments} />
    </div>
  );
}
