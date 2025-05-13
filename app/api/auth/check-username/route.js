import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

export async function POST(request) {
  try {
    const { username } = await request.json();
    if (!username) {
      return NextResponse.json(
        { message: "Username is required" },
        { status: 400 }
      );
    }

    const existingUser = await executeQuery(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    return NextResponse.json(
      { isAvailable: existingUser.length === 0 },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking username:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
