import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

export async function POST(request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    const existingUser = await executeQuery(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    return NextResponse.json(
      { isAvailable: existingUser.length === 0 },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking email:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
