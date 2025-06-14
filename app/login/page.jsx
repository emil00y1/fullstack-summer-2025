// app/login/page.jsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { z } from "zod";
import Link from "next/link";
import { AuthForm } from "@/components/AuthComponent";

// Login-specific validation schema
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password must not be empty"),
});

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const callbackUrl = searchParams.get("callbackUrl");

  // Get error from URL if present
  const urlError = searchParams.get("error");
  let errorMessage = "";
  if (urlError === "Invalid credentials") {
    errorMessage = "Invalid Credentials";
  } else if (urlError) {
    errorMessage = "Invalid Credentials";
  }

  const handleSubmit = async (values) => {
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false, // Handle redirect manually
      });

      if (result?.error) {
        setError("Invalid credentials");
      } else {
        router.push(callbackUrl || "/");
      }
    } catch (error) {
      setError("An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm space-y-6">
        <AuthForm
          type="login"
          schema={loginSchema}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          error={error || errorMessage}
        />
        
        {/* Additional login-specific content */}
        <div className="text-center space-y-4">
          <div className="text-sm">
            Don't have an account?{" "}
            <Link href="/signup" className="underline underline-offset-4 text-blue-600 hover:text-blue-500 cursor-pointer">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}