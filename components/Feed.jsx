"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import PostItem from "./PostItem";
import { Skeleton } from "@/components/ui/skeleton";
import { SessionProvider } from "next-auth/react";
import { CreatePost } from "./CreatePost";
import { Separator } from "./ui/separator";

export default function Feed({ isAdmin }) {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const offsetRef = useRef(0); // Use ref instead of state for offset
  const limit = 10;

  const observerTarget = useRef(null);

  const fetchPosts = async (reset = false) => {
    if (isLoading && !reset) return;

    setIsLoading(true);
    try {
      const currentOffset = reset ? 0 : offsetRef.current;
      const response = await fetch(
        `/api/posts?limit=${limit}&offset=${currentOffset}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      const fetchedPosts = Array.isArray(data) ? data : [];

      if (fetchedPosts.length < limit) {
        setHasMore(false);
      }

      if (reset) {
        setPosts(fetchedPosts);
        offsetRef.current = limit;
      } else {
        setPosts((prevPosts) => [...prevPosts, ...fetchedPosts]);
        offsetRef.current = offsetRef.current + limit;
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Callback to add new post to the beginning of posts array
  const addNewPost = useCallback((newPost) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
  }, []);

  useEffect(() => {
    fetchPosts(true);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          fetchPosts();
        }
      },
      { threshold: 0.5 }
    );

    if (observerTarget.current && posts.length > 0) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [posts, hasMore, isLoading]);

  return (
    <div className="w-full max-w-xl mx-auto p-4">
      <SessionProvider>
        <CreatePost onPostCreated={addNewPost} />
      </SessionProvider>
      <Separator className="my-2" />

      {posts.length === 0 && !isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No posts found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <SessionProvider>
            {posts.map((post) => {
              return (
                <PostItem
                  key={post.uniqueKey || post.encryptedId}
                  post={post}
                  isAdmin={isAdmin}
                />
              );
            })}
          </SessionProvider>
          {posts.length > 0 && hasMore && (
            <div ref={observerTarget} className="h-4" />
          )}

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
