"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import PostItem from "./PostItem";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;

  // Reference to observe for intersection
  const observerTarget = useRef(null);

  const fetchPosts = async (reset = false) => {
    if (isLoading && !reset) return;

    setIsLoading(true);
    try {
      const newOffset = reset ? 0 : offset;
      const response = await fetch(
        `/api/posts?limit=${limit}&offset=${newOffset}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      // Check if data.posts exists and is an array
      const fetchedPosts = Array.isArray(data.posts) ? data.posts : [];

      // Set hasMore flag based on returned posts count
      if (fetchedPosts.length < limit) {
        setHasMore(false);
      }

      if (reset) {
        setPosts(fetchedPosts);
        setOffset(limit);
      } else {
        setPosts((prevPosts) => [...prevPosts, ...fetchedPosts]);
        setOffset(offset + limit);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      // You could add a toast notification here
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchPosts(true);
  }, []);

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // If the target is visible and we have more posts to load
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          fetchPosts();
        }
      },
      { threshold: 0.5 } // Trigger when 50% of the element is visible
    );

    // If we have a target and posts have loaded
    if (observerTarget.current && posts.length > 0) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [posts, hasMore, isLoading]);

  const handleRefresh = () => {
    setHasMore(true);
    fetchPosts(true);
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
          Refresh
        </Button>
      </div>

      {posts.length === 0 && !isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No posts found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            console.log("Rendering post with ID:", post.id);
            return <PostItem key={post.id} post={post} />;
          })}

          {/* Intersection Observer Target - place after loaded posts */}
          {posts.length > 0 && hasMore && (
            <div ref={observerTarget} className="h-4" />
          )}

          {/* Loading skeleton */}
          {isLoading && (
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex gap-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <div className="flex justify-between pt-2">
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* End of feed message */}
          {!hasMore && posts.length > 0 && (
            <div className="text-center py-4 text-gray-500">
              You've reached the end of the timeline
            </div>
          )}
        </div>
      )}
    </div>
  );
}
