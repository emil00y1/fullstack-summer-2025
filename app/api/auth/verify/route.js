// app/api/auth/verify/route.js
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { executeQuery } from "@/lib/db"; // Adjust the import path to match your project structure

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Query to find the user with the specified email
    const sql =
      "SELECT id, username, email, password, created_at, avatar, bio, cover FROM users WHERE email = ?";
    const users = await executeQuery(sql, [email]);

    // Check if user exists
    if (users.length === 0) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const user = users[0];

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Return user data (excluding password)
    const { password: _, ...userData } = user;

    return NextResponse.json(userData);
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
