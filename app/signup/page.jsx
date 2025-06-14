// app/signup/page.jsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { z } from "zod";
import Link from "next/link";
import { AuthForm } from "@/components/AuthComponent";

// Signup-specific validation schema
const signupSchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(25, 'Username must be at most 25 characters')
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'Username can only contain letters, numbers, and underscores'
    ),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
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

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const callbackUrl = searchParams.get("callbackUrl");

  const handleSubmit = async (values) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to sign up");
      }

      // Redirect to verification page
      router.push(`/verify?email=${encodeURIComponent(values.email)}`);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm space-y-6">
        <AuthForm
          type="signup"
          schema={signupSchema}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          error={error}
        />
        
        {/* Additional signup-specific content */}
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
  

          <div className="text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline underline-offset-4 text-blue-600 hover:text-blue-500">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}