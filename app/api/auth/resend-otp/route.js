// app/api/auth/resend-otp/route.js
import { executeQuery } from "@/lib/db";
import { NextResponse } from "next/server";
import { sendVerificationEmail } from "@/lib/emailService";

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

    // Get user with the provided email
    const users = await executeQuery("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (users.length === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const user = users[0];

    // Check if user is already verified
    if (user.is_verified) {
      return NextResponse.json(
        { message: "Email is already verified" },
        { status: 400 }
      );
    }

    // Generate new verification code
    const verificationCode = generateOTP();

    // Set new expiration time (10 minutes from now)
    const verificationCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Update user with new verification code
    await executeQuery(
      `UPDATE users 
       SET verification_code = ?, 
           verification_code_expires_at = ? 
       WHERE email = ?`,
      [verificationCode, verificationCodeExpiresAt, email]
    );

    // Send verification email
    const emailSent = await sendVerificationEmail(
      email,
      user.username,
      verificationCode
    );

    if (!emailSent) {
      return NextResponse.json(
        { message: "Failed to send verification email" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Verification code resent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Resend OTP Error:", error);
    return NextResponse.json(
      { message: "An error occurred while resending verification code" },
      { status: 500 }
    );
  }
}
