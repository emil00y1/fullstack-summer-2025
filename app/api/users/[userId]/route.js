// app/api/users/[userId]/route.js
import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { decryptId } from "@/utils/cryptoUtils";

export async function GET(request, { params }) {
  try {
    const { userId: encryptedUserId } = params;
    const userId = decryptId(encryptedUserId);

    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
    }

    // Fetch user data
    const user = await executeQuery(
      `SELECT id, username, email, avatar, bio, cover, 
       created_at AS createdAt
       FROM users 
       WHERE id = ?`,
      [userId]
    );

    if (user.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get follower/following counts in separate queries
    const followingCount = await executeQuery(
      `SELECT COUNT(*) AS count FROM follows WHERE follower_id = ?`,
      [userId]
    );

    const followerCount = await executeQuery(
      `SELECT COUNT(*) AS count FROM follows WHERE following_id = ?`,
      [userId]
    );

    // Format user data with follower/following counts
    const formattedUser = {
      ...user[0],
      following: followingCount[0].count,
      followers: followerCount[0].count,
    };

    return NextResponse.json(formattedUser);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
