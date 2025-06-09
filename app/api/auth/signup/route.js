import { executeQuery } from '@/lib/db';
import { hash } from 'bcrypt';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { sendVerificationEmail } from '@/lib/emailService';

// Server-side validation schema (matches auth.js and client-side)
const signupSchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Username can only contain letters, numbers, hyphens, and underscores'
    ),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(
      /[!*&?,._-]/,
      'Password must contain at least one special character (!*&?,.-_)'
    ),
});

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request) {
  try {
    const body = await request.json();
    const result = signupSchema.safeParse(body);

    if (!result.success) {
      const errors = result.error.errors;
      for (const error of errors) {
        if (
          error.message === 'Username is required' ||
          error.message === 'Email is required' ||
          error.message === 'Password is required'
        ) {
          return NextResponse.json({ message: error.message }, { status: 400 });
        }
      }
      return NextResponse.json({ message: 'Invalid input' }, { status: 400 });
    }

    const { username, email, password } = result.data;
    const userId = uuidv4();

    // Check for existing username (including soft-deleted)
    const existingUserByUsername = await executeQuery(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (existingUserByUsername.length > 0) {
      const user = existingUserByUsername[0];

      // If user is soft-deleted, we can reactivate
      if (user.deleted_at) {
        // Generate new verification code and hash password
        const verificationCode = generateOTP();
        const verificationCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
        const hashedPassword = await hash(password, 10);

        // Update the soft-deleted user with new data
        await executeQuery(
          `UPDATE users SET 
            email = ?, 
            password = ?, 
            deleted_at = NULL, 
            is_verified = FALSE,
            verification_code = ?,
            verification_code_expires_at = ?,
            created_at = ?
          WHERE username = ?`,
          [
            email,
            hashedPassword,
            verificationCode,
            verificationCodeExpiresAt,
            new Date(),
            username,
          ]
        );

        // Send verification email
        const emailSent = await sendVerificationEmail(
          email,
          username,
          verificationCode
        );

        if (!emailSent) {
          console.error('Failed to send verification email');
        }

        return NextResponse.json(
          {
            message:
              'Account reactivated! Please check your email for verification code.',
            email: email,
          },
          { status: 201 }
        );
      } else {
        // User exists and is active
        return NextResponse.json(
          { message: 'Username is already taken' },
          { status: 409 }
        );
      }
    }

    // Check for existing email (including soft-deleted)
    const existingUserByEmail = await executeQuery(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existingUserByEmail.length > 0) {
      const user = existingUserByEmail[0];

      // If user is soft-deleted, we can reactivate
      if (user.deleted_at) {
        // Generate new verification code and hash password
        const verificationCode = generateOTP();
        const verificationCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
        const hashedPassword = await hash(password, 10);

        // Update the soft-deleted user with new data
        await executeQuery(
          `UPDATE users SET 
            username = ?, 
            password = ?, 
            deleted_at = NULL, 
            is_verified = FALSE,
            verification_code = ?,
            verification_code_expires_at = ?,
            created_at = ?
          WHERE email = ?`,
          [
            username,
            hashedPassword,
            verificationCode,
            verificationCodeExpiresAt,
            new Date(),
            email,
          ]
        );

        // Send verification email
        const emailSent = await sendVerificationEmail(
          email,
          username,
          verificationCode
        );

        if (!emailSent) {
          console.error('Failed to send verification email');
        }

        return NextResponse.json(
          {
            message:
              'Account reactivated! Please check your email for verification code.',
            email: email,
          },
          { status: 201 }
        );
      } else {
        // User exists and is active
        return NextResponse.json(
          { message: 'Email is already registered' },
          { status: 409 }
        );
      }
    }

    // No existing user found - create new user
    const verificationCode = generateOTP();
    const verificationCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const hashedPassword = await hash(password, 10);

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
      console.error('Failed to send verification email');
    }

    return NextResponse.json(
      {
        message:
          'Account created! Please check your email for verification code.',
        email: email,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup Error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      if (error.message.includes('username')) {
        return NextResponse.json(
          { message: 'Username is already taken' },
          { status: 409 }
        );
      }
      if (error.message.includes('email')) {
        return NextResponse.json(
          { message: 'Email is already registered' },
          { status: 409 }
        );
      }
    }
    return NextResponse.json(
      { message: 'An error occurred during signup' },
      { status: 500 }
    );
  }
}
