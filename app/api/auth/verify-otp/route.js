// app/api/auth/verify-otp/route.js
import { executeQuery } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { email, verificationCode } = await request.json();

    if (!email || !verificationCode) {
      return NextResponse.json(
        { message: "Email and verification code are required" },
        { status: 400 }
      );
    }

    // Get user with the provided email
    const users = await executeQuery(
      `SELECT * FROM users 
       WHERE email = ? AND verification_code = ? 
       AND verification_code_expires_at > NOW()
       AND is_verified = false`,
      [email, verificationCode]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { message: "Invalid or expired verification code" },
        { status: 400 }
      );
    }

    // Mark user as verified
    await executeQuery(
      `UPDATE users 
       SET is_verified = true, 
           verification_code = NULL, 
           verification_code_expires_at = NULL 
       WHERE email = ?`,
      [email]
    );

    return NextResponse.json(
      { message: "Email verified successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Verification Error:", error);
    return NextResponse.json(
      { message: "An error occurred during verification" },
      { status: 500 }
    );
  }
}
