"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import PostItem from "./PostItem";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SessionProvider } from "next-auth/react";
import { CreatePost } from "./CreatePost";
import { Separator } from "./ui/separator";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;

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
      const fetchedPosts = Array.isArray(data) ? data : [];

      const formattedPosts = fetchedPosts.map((post) => ({
        encryptedId: post.encryptedId,
        body: post.content,
        createdAt: post.created_at,
        likesCount: post.like_count,
        commentsCount: post.comment_count,
        user: {
          username: post.user.username,
          name: post.user.username,
          avatar: post.user.avatar,
        },
        likes: [],
      }));

      if (fetchedPosts.length < limit) {
        setHasMore(false);
      }

      if (reset) {
        setPosts(formattedPosts);
        setOffset(limit);
      } else {
        setPosts((prevPosts) => [...prevPosts, ...formattedPosts]);
        setOffset(offset + limit);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleRefresh = () => {
    setHasMore(true);
    fetchPosts(true);
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <SessionProvider>
        <CreatePost />
      </SessionProvider>
      <Separator className="my-2" />

      {posts.length === 0 && !isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No posts found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <SessionProvider>
            {posts.map((post) => (
              <PostItem key={post.encryptedId} post={post} />
            ))}
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
