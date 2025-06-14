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

  // Get error from URL if present
  const urlError = searchParams.get("error");
  const resetSuccess = searchParams.get("reset");

  let errorMessage = "";
  let successMessage = "";

  if (urlError === "Invalid credentials") {
    errorMessage = "Invalid Credentials";
  } else if (urlError) {
    errorMessage = "Invalid Credentials";
  }

  if (resetSuccess === "true") {
    successMessage =
      "Password reset successfully! Please log in with your new password.";
  }

  const handleSubmit = async (values) => {
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid credentials");
      } else {
        window.location.href = "/";
      }
    } catch (error) {
      setError("An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm space-y-6">
          {successMessage && (
            <div className="p-3 text-sm bg-green-100 border border-green-400 text-green-700 rounded">
              {successMessage}
            </div>
          )}

          <AuthForm
            type="login"
            schema={loginSchema}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            error={error || errorMessage}
          />

          <div className="text-center space-y-4">
            <div className="text-sm">
              <Link
                href="/forgot-password"
                className="text-blue-600 hover:text-blue-500 hover:underline"
              >
                Forgot your password?
              </Link>
            </div>
            <div className="text-sm">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="underline underline-offset-4 text-blue-600 hover:text-blue-500 cursor-pointer"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
