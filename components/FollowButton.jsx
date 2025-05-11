"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function FollowButton({ userId, initialIsFollowing }) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);

  const handleFollowToggle = async () => {
    try {
      setIsLoading(true);
      
      // Create form data to send
      const formData = new FormData();
      formData.append("userId", userId);
      
      // Send follow/unfollow request to API
      const response = await fetch("/api/follow", {
        method: "POST",
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Toggle the follow state based on the response
        setIsFollowing(data.action === "followed");
      } else {
        // Handle error case
        console.error("Follow action failed:", data.error);
        // Optionally show error message to user
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
      className={`rounded-full ${isFollowing ? "border-gray-300" : ""}`}
      onClick={handleFollowToggle}
      disabled={isLoading}
    >
      {isLoading ? (
        <span className="animate-pulse">Loading...</span>
      ) : isFollowing ? (
        "Following"
      ) : (
        "Follow"
      )}
    </Button>
  );
}