// app/api/auth/forgot-password/route.js
import { executeQuery } from "@/lib/db";
import { NextResponse } from "next/server";
import { sendPasswordResetEmail } from "@/lib/emailService";

// Generate a random 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    // Check if user exists with this email
    const users = await executeQuery("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (users.length === 0) {
      return NextResponse.json(
        { message: "If an account with this email exists, a reset code has been sent" },
        { status: 200 }
      );
    }

    const user = users[0];

    // Check if user account is soft deleted
    if (user.deleted_at !== null) {
      return NextResponse.json(
        { message: "If an account with this email exists, a reset code has been sent" },
        { status: 200 }
      );
    }

    // Generate new verification code for password reset
    const verificationCode = generateOTP();
    const verificationCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with new verification code
    await executeQuery(
      `UPDATE users 
       SET verification_code = ?, 
           verification_code_expires_at = ? 
       WHERE email = ?`,
      [verificationCode, verificationCodeExpiresAt, email]
    );

    // Send password reset email
    const emailSent = await sendPasswordResetEmail(
      email,
      user.username,
      verificationCode
    );

    if (!emailSent) {
      return NextResponse.json(
        { message: "Failed to send reset email" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Reset code sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json(
      { message: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}