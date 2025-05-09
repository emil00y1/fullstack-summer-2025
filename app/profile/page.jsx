// app/profile/page.jsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ClientTabs from "./ClientTabs";
import Link from "next/link";

export default async function ProfilePage() {
  // Get session using auth()
  const session = await auth();
  
  // Redirect if no session
  if (!session || !session.user) {
    redirect("/login");
  }
  
  const userId = session.user.id;
  
  // Fetch user posts
  const postsResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/users/${userId}/posts`);
  const postsData = await postsResponse.json();
  const posts = postsData.posts || [];
  
  // Fetch user comments
  const commentsResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/users/${userId}/comments`);
  const commentsData = await commentsResponse.json();
  const comments = commentsData.comments || [];
  
  // User data from session
  const userData = session.user;
  
  // Generate username from email if not available
  const username = userData?.username || userData?.email?.split("@")[0] || "user";

  return (
    <div className="max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center p-4 border-b">
        <Link href="/" className="mr-6">
          <Button variant="ghost">
            ←
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">{userData?.name || "My Profile"}</h1>
          <p className="text-gray-500 text-sm">{posts.length} posts</p>
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
              {userData?.name?.[0]?.toUpperCase() || "U"}
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
        <h2 className="font-bold text-xl">{userData?.name}</h2>
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
      <ClientTabs posts={posts} comments={comments} />
    </div>
  );
}