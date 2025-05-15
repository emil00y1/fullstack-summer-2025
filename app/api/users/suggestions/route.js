import { executeQuery } from "@/lib/db";
import { auth } from "@/auth";

export async function GET() {
  try {
    // Get the current user session
    const session = await auth();
    const currentUserId = session?.user?.id;
    
    // If user is not logged in, return random users
    if (!currentUserId) {
      const randomUsers = await executeQuery(
        `SELECT id, username, email, avatar
         FROM users
         ORDER BY RAND() 
         LIMIT 3`,
        []
      );
      
      const formattedUsers = randomUsers.map(user => ({
        id: user.id,
        name: user.username,
        avatar: user.avatar
      }));
      
      return Response.json(formattedUsers);
    }
    
    // Get the IDs of users that the current user follows
    const followedUsers = await executeQuery(
      `SELECT following_id
       FROM follows
       WHERE follower_id = ?`,
      [currentUserId]
    );
    
    const followedUserIds = followedUsers.map(user => user.following_id);
    
    // Add the current user's ID to the exclusion list
    const excludeIds = [currentUserId, ...followedUserIds];
    
    // Build parameterized query with placeholders for each ID to exclude
    const placeholders = excludeIds.map(() => '?').join(',');
    
    let query;
    let queryParams;
    
    if (excludeIds.length > 0) {
      query = `
        SELECT id, username, email, avatar
        FROM users
        WHERE id NOT IN (${placeholders})
        ORDER BY RAND()
        LIMIT 3
      `;
      queryParams = excludeIds;
    } else {
      // Fallback if somehow there are no IDs to exclude
      query = `
        SELECT id, username, email, avatar
        FROM users
        ORDER BY RAND()
        LIMIT 3
      `;
      queryParams = [];
    }
    
    // Get random users excluding the current user and followed users
    const suggestedUsers = await executeQuery(query, queryParams);
    
    const formattedUsers = suggestedUsers.map(user => ({
      id: user.id,
      name: user.username,
      avatar: user.avatar
    }));
    
    return Response.json(formattedUsers);
  } catch (error) {
    console.error("Error fetching user suggestions:", error);
    return Response.json(
      { error: "Failed to fetch user suggestions" },
      { status: 500 }
    );
  }
}