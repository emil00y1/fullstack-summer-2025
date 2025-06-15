import { executeQuery } from "@/lib/db";
import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import { z } from "zod";

const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  verificationCode: z.string().length(6, "Verification code must be 6 digits"),
  newPassword: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(
      /[!*&?,._-]/,
      "Password must contain at least one special character (!*&?,.-_)"
    ),
});

export async function POST(request) {
  try {
    const body = await request.json();

    // Validate input
    const result = resetPasswordSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { message: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, verificationCode, newPassword } = result.data;

    // Find user with valid verification code
    const users = await executeQuery(
      `SELECT * FROM users 
       WHERE email = ? 
       AND verification_code = ? 
       AND verification_code_expires_at > NOW()
       AND deleted_at IS NULL`,
      [email, verificationCode]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { message: "Invalid or expired verification code" },
        { status: 400 }
      );
    }

    const user = users[0];

    // Hash the new password
    const hashedPassword = await hash(newPassword, 10);

    // Update user password and clear verification code
    await executeQuery(
      `UPDATE users 
       SET password = ?, 
           verification_code = NULL, 
           verification_code_expires_at = NULL 
       WHERE email = ?`,
      [hashedPassword, email]
    );

    return NextResponse.json(
      { message: "Password reset successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset Password Error:", error);
    return NextResponse.json(
      { message: "An error occurred while resetting password" },
      { status: 500 }
    );
  }
}
