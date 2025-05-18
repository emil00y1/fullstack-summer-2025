import { executeQuery } from "@/lib/db";
import { hash } from "bcrypt";
import { NextResponse } from "next/server";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { sendVerificationEmail } from "@/lib/emailService";

// Server-side validation schema (matches auth.js and client-side)
const signupSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, hyphens, and underscores"
    ),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters")
    .regex(
      /[A-Z]/,
      "Password must contain at least one uppercase letter and special character (!*&?,.-_)"
    )
    .regex(
      /[!*&?,.-_]/,
      "Password must contain at least one uppercase letter and special character (!*&?,.-_)"
    ),
});

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input data
    const result = signupSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.errors;
      // Check for specific missing field errors
      for (const error of errors) {
        if (
          error.message === "Username is required" ||
          error.message === "Email is required" ||
          error.message === "Password is required"
        ) {
          return NextResponse.json({ message: error.message }, { status: 400 });
        }
      }
      // Return generic error for other validation failures
      return NextResponse.json({ message: "Invalid input" }, { status: 400 });
    }

    const { username, email, password } = result.data;

    // Generate UUID for user id
    const userId = uuidv4();

    // Check if username already exists
    const existingUserByUsername = await executeQuery(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );
    if (existingUserByUsername.length > 0) {
      return NextResponse.json(
        { message: "Username is already taken" },
        { status: 409 }
      );
    }

    // Check if email already exists
    const existingUserByEmail = await executeQuery(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    if (existingUserByEmail.length > 0) {
      return NextResponse.json(
        { message: "Email is already registered" },
        { status: 409 }
      );
    }

    const verificationCode = generateOTP();

    const verificationCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Hash the password
    const hashedPassword = await hash(password, 10);

    // Insert the user into the database
    await executeQuery(
      `INSERT INTO users (
        id, username, email, password, created_at, 
        is_verified, verification_code, verification_code_expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        username,
        email,
        hashedPassword,
        new Date(),
        false,
        verificationCode,
        verificationCodeExpiresAt,
      ]
    );

    const emailSent = await sendVerificationEmail(
      email,
      username,
      verificationCode
    );

    if (!emailSent) {
      console.error("Failed to send verification email");
      // Consider handling this case (perhaps delete the user and return an error)
    }

    // Return success response
    return NextResponse.json(
      {
        message:
          "Account created! Please check your email for verification code.",
        email: email, // Return the email for the verification page
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup Error:", error);
    if (error.code === "ER_DUP_ENTRY") {
      if (error.message.includes("username")) {
        return NextResponse.json(
          { message: "Username is already taken" },
          { status: 409 }
        );
      }
      if (error.message.includes("email")) {
        return NextResponse.json(
          { message: "Email is already registered" },
          { status: 409 }
        );
      }
    }
    return NextResponse.json(
      { message: "An error occurred during signup" },
      { status: 500 }
    );
  }
}
