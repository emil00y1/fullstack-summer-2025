import { executeQuery } from "@/lib/db";
import { hash } from "bcrypt";
import { NextResponse } from "next/server";
import { z } from "zod";

// Server-side validation schema (matches client-side)
const signupSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(request) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate input data
    const result = signupSchema.safeParse(body);
    if (!result.success) {
      // Return validation errors
      return NextResponse.json(
        { message: "Validation failed", errors: result.error.errors },
        { status: 400 }
      );
    }
    
    const { username, email, password } = result.data;
    
    // Check if user already exists
    const existingUser = await executeQuery(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    
    if (existingUser.length > 0) {
      return NextResponse.json(
        { message: "Email already exists" },
        { status: 409 }
      );
    }
    
    // Hash the password
    const hashedPassword = await hash(password, 10);
    
    // Insert the user into the database
    await executeQuery(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashedPassword]
    );
    
    // Return success response
    return NextResponse.json(
      { message: "Account created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup Error:", error);
    return NextResponse.json(
      { message: "An error occurred during signup" },
      { status: 500 }
    );
  }
}