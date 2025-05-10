// app/profile/page.jsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ClientTabs from "./ClientTabs";
import Link from "next/link";
import { executeQuery } from "@/lib/db";
import BackButton from "@/components/BackButton";

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
      (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
      (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE p.user_id = ?
    ORDER BY p.created_at DESC`,
    [userId]
  );
  
  // Format posts to match the expected structure
  const formattedPosts = posts.map(post => ({
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
      name: post.username, // Use username as name
      email: post.email,
      image: null
    },
    comments: [],
    likes: []
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
  const formattedComments = comments.map(comment => ({
    id: comment.id,
    body: comment.body,
    createdAt: comment.created_at,
    userId: comment.user_id,
    postId: comment.post_id,
    likesCount: comment.like_count || 0,
    user: {
      id: comment.user_id,
      username: comment.username,
      name: comment.username,
      email: comment.email,
      image: null
    },
    post: {
      id: comment.post_id,
      body: comment.post_content,
      user: {
        id: comment.post_user_id,
        username: comment.post_username
      }
    },
    likes: []
  }));
  
  // User data from session
  const userData = session.user;
  
  // Generate username from email if not available
  const username = userData?.username || userData?.email?.split("@")[0] || "user";

  return (
    <div className="max-w-xl mx-auto min-w-[450px]">
      {/* Header */}
      <div className="flex items-center p-4 border-b">
        <BackButton href="/"/>
        <div>
          <h1 className="text-xl font-bold">{userData?.name || username}</h1>
          <p className="text-gray-500 text-sm">{formattedPosts.length} posts</p>
        </div>
      </div>
      
      {/* Profile header with cover and avatar */}
      <div className="relative">
        {/* Cover image */}
        <div className="h-32 bg-gray-200">
          {userData?.coverImage && (
            <img 
              src={userData.coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          )}
        </div>
        
        {/* Profile avatar using Avatar component */}
        <div className="absolute -bottom-12 left-4">
          <Avatar className="h-24 w-24 border-4 border-white">
            <AvatarImage
              src={userData?.image || "https://github.com/shadcn.png"}
              alt={userData?.name || "Profile"}
              className="w-full h-full object-cover"
            />
            <AvatarFallback className="text-2xl">
              {userData?.name?.[0]?.toUpperCase() || username[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </div>
        
        {/* Edit profile button */}
        <div className="absolute right-4 bottom-4">
          <Link href="/profile/edit">
            <Button variant="outline" className="rounded-full">
              Edit profile
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Profile info */}
      <div className="mt-14 px-4">
        <h2 className="font-bold text-xl">{userData?.name || username}</h2>
        <p className="text-gray-500">@{username}</p>
        
        {/* Bio */}
        <p className="mt-2">{userData?.bio || "No bio yet"}</p>
        
        {/* Contact & joined date */}
        <div className="flex flex-wrap gap-4 mt-2 text-gray-500 text-sm">
          {userData?.location && (
            <span>{userData.location}</span>
          )}
          {userData?.website && (
            <a href={userData.website} className="text-blue-500">
              {userData.website}
            </a>
          )}
          <span>Joined {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "recently"}</span>
        </div>
        
        {/* Following/Followers */}
        <div className="flex gap-4 mt-2">
          <span>
            <span className="font-semibold">{userData?.following || 0}</span>{" "}
            <span className="text-gray-500">Following</span>
          </span>
          <span>
            <span className="font-semibold">{userData?.followers || 0}</span>{" "}
            <span className="text-gray-500">Followers</span>
          </span>
        </div>
      </div>
      
      {/* Tabs using client component wrapper */}
      <ClientTabs posts={formattedPosts} comments={formattedComments} />
    </div>
  );
}