import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import bcrypt from "bcrypt";

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const users = await executeQuery("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    const user = users[0];

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      id: user.id,
      username: user.username,
      email: user.email,
      created_at: user.created_at,
      bio: user.bio || "",
      cover: user.cover || "",
      avatar: user.avatar || "",
    });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: "Invalid credentials" }, { status: 500 });
  }
}
