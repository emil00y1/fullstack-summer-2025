import { redirect } from "next/navigation";
import { auth } from "@/auth";
import ClientTabs from "@/components/profile/ClientTabs";
import { executeQuery } from "@/lib/db";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileInfo from "@/components/profile/ProfileInfo";
import { encryptId } from "@/utils/cryptoUtils";

export default async function ProfilePage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/login");
  }

  const userId = session.user.id;

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

  const formattedPosts = posts.map((post) => ({
    encryptedId: encryptId(post.id),
    body: post.content,
    createdAt: post.created_at,
    likesCount: post.like_count,
    commentsCount: post.comment_count,
    isPublic: post.is_public === 1,
    user: {
      username: post.username,
      avatar: post.avatar,
      name: post.username,
    },
    comments: [],
    likes: [],
  }));

  const comments = await executeQuery(
    `SELECT 
      c.id, 
      c.content as body, 
      c.created_at, 
      c.user_id,
      c.post_id,
      u.username,
      u.email,
      u.avatar,
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

  const formattedComments = comments.map((comment) => ({
    encryptedId: encryptId(comment.id),
    body: comment.body,
    createdAt: comment.created_at,
    postId: encryptId(comment.post_id),
    likesCount: comment.like_count || 0,
    user: {
      username: comment.username,
      avatar: comment.avatar,
      name: comment.username,
    },
    post: {
      encryptedId: encryptId(comment.post_id),
      body: comment.post_content,
      user: {
        username: comment.post_username,
      },
    },
    likes: [],
  }));

  const sessionUser = session.user;

  const user = await executeQuery(
    "SELECT avatar, bio, cover FROM users WHERE id = ?",
    [userId]
  );

  const userData = {
    ...sessionUser,
    avatar: user[0]?.avatar || null,
    bio: user[0]?.bio || null,
    cover: user[0]?.cover || null,
  };

  return (
    <div>
      <ProfileHeader
        username={userData.username}
        postsAmount={formattedPosts.length}
      />

      <ProfileInfo userData={userData} isOwnAccount={true} />

      <ClientTabs posts={formattedPosts} comments={formattedComments} />
    </div>
  );
}
