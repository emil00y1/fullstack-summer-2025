// app/verify/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams?.get("email") || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(600); // 10 minutes in seconds
  const [shouldRedirect, setShouldRedirect] = useState(false);

  // Handle missing email parameter - use useEffect to avoid the hydration error
  useEffect(() => {
    // If no email is provided, redirect to signup page
    if (!email) {
      setShouldRedirect(true);
    }
  }, [email]);

  // Separate useEffect for the redirection to avoid state updates during render
  useEffect(() => {
    if (shouldRedirect) {
      router.push("/signup");
    }
  }, [shouldRedirect, router]);

  // Handle countdown timer
  useEffect(() => {
    if (countdown > 0 && !success) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, success]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Handle OTP input change
  const handleChange = (e, index) => {
    const value = e.target.value;

    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    // Create a new array to avoid mutation
    const newOtp = [...otp];

    // For each character in the input value
    if (value) {
      // If pasting multiple digits
      if (value.length > 1) {
        const digits = value.split("").slice(0, 6 - index);
        digits.forEach((digit, i) => {
          if (index + i < 6) {
            newOtp[index + i] = digit;
          }
        });
      } else {
        // Single digit input
        newOtp[index] = value;
        // Auto-focus next input
        if (index < 5) {
          const nextInput = document.getElementById(`otp-${index + 1}`);
          if (nextInput) nextInput.focus();
        }
      }
    } else {
      // Handle backspace
      newOtp[index] = "";
    }

    setOtp(newOtp);
  };

  // Handle key press for navigation between inputs
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      // Move to previous input when pressing backspace on an empty input
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      // Move to previous input with left arrow
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      // Move to next input with right arrow
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  // Submit verification code
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const verificationCode = otp.join("");

    if (verificationCode.length !== 6) {
      setError("Please enter the complete 6-digit code");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          verificationCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to verify email");
      }

      setSuccess(true);

      // Redirect to login page after successful verification
      setTimeout(() => {
        router.push("/login?verified=true");
      }, 2000);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Request a new verification code
  const handleResendCode = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to resend verification code");
      }

      // Reset countdown
      setCountdown(600);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // If we're still checking or about to redirect, show a simple loading state
  if (!email) {
    return (
      <div className="container mx-auto max-w-md py-10 flex justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-md py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Verify Your Email</CardTitle>
          <CardDescription>
            Enter the 6-digit code sent to {email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 text-sm bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {success ? (
            <div className="p-3 text-sm bg-green-100 border border-green-400 text-green-700 rounded">
              Email verified successfully! Redirecting to login...
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-between gap-2">
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      pattern="\d*"
                      maxLength={1}
                      className="w-12 h-12 text-center text-xl"
                      value={digit}
                      onChange={(e) => handleChange(e, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      disabled={isLoading}
                      autoFocus={index === 0}
                    />
                  ))}
                </div>

                <div className="text-center text-sm text-gray-500">
                  Code expires in: {formatTime(countdown)}
                </div>

                <Button
                  type="submit"
                  className="w-full cursor-pointer"
                  disabled={isLoading || otp.join("").length !== 6}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="animate-spin mr-2" />
                      Verifying...
                    </span>
                  ) : (
                    "Verify Email"
                  )}
                </Button>
              </form>

              <div className="mt-4 text-center">
                <Button
                  variant="link"
                  onClick={handleResendCode}
                  disabled={isLoading || countdown > 540} // Only allow resend after 1 minute
                  className="text-sm"
                >
                  {countdown > 540
                    ? `Resend code available in ${formatTime(countdown - 540)}`
                    : "Didn't receive the code? Resend"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
