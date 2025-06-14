"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import BackButton from "@/components/BackButton";
import SearchField from "@/components/SearchField";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [results, setResults] = useState({ users: [], posts: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}`
      );
      if (!response.ok) throw new Error("Search failed");

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center p-4 border-b">
        <BackButton href="/" />
        <h1 className="text-xl font-bold ml-4">Search</h1>
      </div>

      {/* Search field */}
      <div className="py-4">
        <SearchField />
      </div>

      {query ? (
        <>
          <div className="py-2 px-4">
            <h2 className="font-medium">Search results for "{query}"</h2>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">
                All
              </TabsTrigger>
              <TabsTrigger value="people" className="flex-1">
                People ({results.users.length})
              </TabsTrigger>
              <TabsTrigger value="posts" className="flex-1">
                Posts ({results.posts.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="inline-block animate-spin h-8 w-8 border-4 border-gray-300 border-t-blue-500 rounded-full"></div>
                  <p className="mt-2 text-gray-500">Searching...</p>
                </div>
              ) : results.users.length === 0 && results.posts.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No results found for "{query}"
                </div>
              ) : (
                <>
                  {/* Users preview */}
                  {results.users.length > 0 && (
                    <div className="border-b">
                      <div className="p-3 flex justify-between items-center">
                        <h3 className="text-lg font-semibold">People</h3>
                        {results.users.length > 3 && (
                          <button
                            onClick={() => setActiveTab("people")}
                            className="text-sm text-blue-500"
                          >
                            View all
                          </button>
                        )}
                      </div>
                      {results.users.slice(0, 3).map((user) => (
                        <UserItem key={user.username} user={user} />
                      ))}
                    </div>
                  )}

                  {/* Posts preview */}
                  {results.posts.length > 0 && (
                    <div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 flex justify-between items-center">
                        <h3 className="font-medium">Posts</h3>
                        {results.posts.length > 3 && (
                          <button
                            onClick={() => setActiveTab("posts")}
                            className="text-sm text-blue-500"
                          >
                            View all
                          </button>
                        )}
                      </div>
                      {results.posts.slice(0, 3).map((post) => (
                        <PostItem key={post.id} post={post} />
                      ))}
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="people">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="inline-block animate-spin h-8 w-8 border-4 border-gray-300 border-t-blue-500 rounded-full"></div>
                </div>
              ) : results.users.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No users found for "{query}"
                </div>
              ) : (
                <div className="divide-y">
                  {results.users.map((user) => (
                    <UserItem key={user.username} user={user} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="posts">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="inline-block animate-spin h-8 w-8 border-4 border-gray-300 border-t-blue-500 rounded-full"></div>
                </div>
              ) : results.posts.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No posts found for "{query}"
                </div>
              ) : (
                <div className="divide-y">
                  {results.posts.map((post) => (
                    <PostItem key={post.id} post={post} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <div className="p-8 text-center text-gray-500">
          Enter a search term to find users and posts
        </div>
      )}
    </div>
  );
}

function UserItem({ user }) {
  return (
    <Link
      href={`/user/${user.username}`}
      className="flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-800"
    >
      <Avatar className="h-10 w-10 mr-3">
        <AvatarImage
          src={
            user.avatar ||
            `https://api.dicebear.com/6.x/avataaars/svg?seed=${user.username}`
          }
          alt={user.username}
        />
        <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div>
        <div className="font-medium">@{user.username}</div>
      </div>
    </Link>
  );
}

function PostItem({ post }) {
  return (
    <Link
      href={`/posts/${post.id}`}
      className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-800"
    >
      <div className="flex items-center mb-2">
        <Avatar className="h-6 w-6 mr-2">
          <AvatarImage
            src={
              post.avatar ||
              `https://api.dicebear.com/6.x/avataaars/svg?seed=${post.username}`
            }
            alt={post.username}
          />
          <AvatarFallback>
            {post.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm text-gray-500">@{post.username}</span>
        <span className="text-sm text-gray-500 mx-1">·</span>
        <span className="text-sm text-gray-500">
          {new Date(post.created_at).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>
      <p className="line-clamp-3">{post.content}</p>
    </Link>
  );
}
