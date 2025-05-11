// app/api/follow/route.js
import { executeQuery } from "@/lib/db";
import { auth } from "@/auth";

export async function POST(request) {
  try {
    // Get the authenticated user session
    const session = await auth();

    // Check if user is authenticated
    if (!session || !session.user) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get the authenticated user's ID
    const followerId = session.user.id;

    // Get form data from request
    const { userId: userToFollowId } = await request.json();

    if (!userToFollowId) {
      return new Response(JSON.stringify({ error: "User ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Prevent users from following themselves
    if (followerId === Number(userToFollowId)) {
      return new Response(
        JSON.stringify({ error: "You cannot follow yourself" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Check if already following
    const existingFollow = await executeQuery(
      "SELECT id FROM follows WHERE follower_id = ? AND following_id = ?",
      [followerId, userToFollowId]
    );

    // If already following, unfollow
    if (existingFollow && existingFollow.length > 0) {
      await executeQuery(
        "DELETE FROM follows WHERE follower_id = ? AND following_id = ?",
        [followerId, userToFollowId]
      );

      // Update followers count (Optional, for real-time feedback)
      const followersCount = await executeQuery(
        "SELECT COUNT(*) as count FROM follows WHERE following_id = ?",
        [userToFollowId]
      );

      return new Response(
        JSON.stringify({
          success: true,
          action: "unfollowed",
          followersCount: followersCount[0].count,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    // Otherwise, create new follow
    else {
      await executeQuery(
        "INSERT INTO follows (follower_id, following_id) VALUES (?, ?)",
        [followerId, userToFollowId]
      );

      // Update followers count (Optional, for real-time feedback)
      const followersCount = await executeQuery(
        "SELECT COUNT(*) as count FROM follows WHERE following_id = ?",
        [userToFollowId]
      );

      return new Response(
        JSON.stringify({
          success: true,
          action: "followed",
          followersCount: followersCount[0].count,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Error handling follow:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process follow request" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
