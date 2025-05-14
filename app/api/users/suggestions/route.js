import { executeQuery } from "@/lib/db";
import { auth } from "@/auth";

export async function GET() {
  try {
    // Get the current user session
    const session = await auth();
    const currentUserId = session?.user?.id;
    
    let query = `
      SELECT id, username, email, avatar 
      FROM users 
      WHERE 1=1
    `;
    
    const params = [];
    
    // Exclude current user if logged in
    if (currentUserId) {
      query += " AND id != ?";
      params.push(currentUserId);
    }
    
    query += " ORDER BY RAND() LIMIT 3";
    
    // Get random users excluding the current user (if authenticated)
    const users = await executeQuery(query, params);
    
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.username,
      handle: `@${user.email.split('@')[0]}`,
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