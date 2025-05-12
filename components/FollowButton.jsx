"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";

export default function FollowButton({ userId, initialIsFollowing = false }) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);

  const handleFollowToggle = async () => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/follow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (data.success) {
        setIsFollowing(data.action === "followed");
      } else {
        console.error("Follow action failed:", data.error);
      }
    } catch (error) {
      console.error("Error following user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={isFollowing ? "outline" : "default"}
      className={`rounded-full cursor-pointer ${
        isFollowing ? "border-gray-300" : ""
      }`}
      onClick={handleFollowToggle}
      disabled={isLoading}
    >
      {isLoading ? (
        <span className="animate-spin">
          <Loader2 />
        </span>
      ) : isFollowing ? (
        <>
          Following <Check />
        </>
      ) : (
        "Follow"
      )}
    </Button>
  );
}
