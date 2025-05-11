import { notFound } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import BackButton from "@/components/BackButton";
import { executeQuery } from "@/lib/db";
import FollowButton from "@/components/FollowButton";
import { auth } from "@/auth"; // Import auth

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

    // Check if user exists
    if (!users || users.length === 0) {
      return notFound();
    }

    const userData = users[0];

    // Fetch user's posts
    const posts = await executeQuery(
      `SELECT p.*, 
       (SELECT COUNT(*) FROM likes WHERE post_id = p.id) AS like_count,
       (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comment_count
       FROM posts p
       WHERE p.user_id = ? AND p.is_public = 1
       ORDER BY p.created_at DESC`,
      [userData.id]
    );

    // Fetch user's comments
    const comments = await executeQuery(
      `SELECT c.*, p.id AS post_id, u.username AS post_author
       FROM comments c
       JOIN posts p ON c.post_id = p.id
       JOIN users u ON p.user_id = u.id
       WHERE c.user_id = ?
       ORDER BY c.created_at DESC`,
      [userData.id]
    );

    // Format comments to include post info
    const formattedComments = comments.map((comment) => ({
      ...comment,
      post: {
        user: {
          username: comment.post_author,
        },
      },
    }));

    return (
      <div>
        {/* Header */}
        <div className="flex items-center p-4 border-b">
          <BackButton href="/" />
          <div>
            <h1 className="text-xl font-bold">{userData.username}</h1>
            <p className="text-gray-500 text-sm">{posts.length} posts</p>
          </div>
        </div>

        {/* Profile header with avatar */}
        <div className="relative">
          <div className="h-32 bg-gray-200"></div>

          {/* Profile avatar */}
          <div className="absolute -bottom-12 left-4">
            <Avatar className="h-24 w-24 border-4 border-white">
              <AvatarImage
                src={
                  userData.avatar ||
                  "https://api.dicebear.com/6.x/avataaars/svg?seed=default"
                }
                alt={userData.username}
                className="w-full h-full object-cover"
              />
              <AvatarFallback className="text-2xl">
                {userData.username[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Follow button */}
          <div className="absolute right-4 bottom-4">
            <form action="/api/follow" method="POST">
              <input type="hidden" name="userId" value={userData.id} />
              <Button type="submit" className="rounded-full">
                Follow
              </Button>
            </form>
          </div>
        </div>

        {/* Profile info */}
        <div className="mt-14 px-4">
          <h2 className="font-bold text-xl">@{userData.username}</h2>
          <p className="text-gray-500">{userData.email}</p>

          {/* Joined date */}
          <div className="flex flex-wrap gap-4 mt-2 text-gray-500 text-sm">
            <span>
              Joined{" "}
              {userData.created_at
                ? new Date(userData.created_at).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })
                : "recently"}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 border-t">
          <Tabs defaultValue="posts">
            <TabsList className="w-full">
              <TabsTrigger value="posts" className="flex-1">
                Posts
              </TabsTrigger>
              <TabsTrigger value="comments" className="flex-1">
                Comments
              </TabsTrigger>
              <TabsTrigger value="likes" className="flex-1">
                Likes
              </TabsTrigger>
            </TabsList>
            <TabsContent value="posts">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <div key={post.id} className="p-4 border-b">
                    <p className="mb-2">{post.content}</p>
                    <div className="flex items-center gap-4 text-gray-500 text-sm">
                      <span>
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                      <span>{post.like_count} likes</span>
                      <span>{post.comment_count} comments</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="p-4 text-center text-gray-500">No posts yet</p>
              )}
            </TabsContent>
            <TabsContent value="comments">
              {formattedComments.length > 0 ? (
                formattedComments.map((comment) => (
                  <div key={comment.id} className="p-4 border-b">
                    <div className="text-sm text-gray-500 mb-1">
                      Replied to @{comment.post.user.username}'s post
                    </div>
                    <p className="mb-2">{comment.content}</p>
                    <div className="flex items-center gap-4 text-gray-500 text-sm">
                      <span>
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="p-4 text-center text-gray-500">No comments yet</p>
              )}
            </TabsContent>
            <TabsContent value="likes">
              <p className="p-4 text-center text-gray-500">No likes yet</p>
            </TabsContent>
          </Tabs>
        </div>
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
