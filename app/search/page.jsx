"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Hash } from "lucide-react";
import BackButton from "@/components/BackButton";
import SearchField from "@/components/SearchField";
import PostItem from "@/components/PostItem";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [results, setResults] = useState({
    users: [],
    posts: [],
    hashtags: [],
  });
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

  const isHashtagSearch = query.startsWith("#");

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
            <h2 className="font-medium">
              Search results for "{query}"
              {isHashtagSearch && (
                <span className="text-sm text-gray-500 ml-2">
                  (hashtag search)
                </span>
              )}
            </h2>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">
                All
              </TabsTrigger>
              {!isHashtagSearch && (
                <TabsTrigger value="people" className="flex-1">
                  People ({results.users.length})
                </TabsTrigger>
              )}
              <TabsTrigger value="posts" className="flex-1">
                Posts ({results.posts.length})
              </TabsTrigger>
              {results.hashtags.length > 0 && (
                <TabsTrigger value="hashtags" className="flex-1">
                  Hashtags ({results.hashtags.length})
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="all">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="inline-block animate-spin h-8 w-8 border-4 border-gray-300 border-t-blue-500 rounded-full"></div>
                  <p className="mt-2 text-gray-500">Searching...</p>
                </div>
              ) : results.users.length === 0 &&
                results.posts.length === 0 &&
                results.hashtags.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No results found for "{query}"
                </div>
              ) : (
                <>
                  {/* Hashtags preview */}
                  {results.hashtags.length > 0 && (
                    <div className="border-b">
                      <div className="p-3 flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Hashtags</h3>
                        {results.hashtags.length > 3 && (
                          <button
                            onClick={() => setActiveTab("hashtags")}
                            className="text-sm text-blue-500"
                          >
                            View all
                          </button>
                        )}
                      </div>
                      {results.hashtags.map((hashtag) => (
                        <HashtagItem key={hashtag.name} hashtag={hashtag} />
                      ))}
                    </div>
                  )}

                  {/* Users preview */}
                  {!isHashtagSearch && results.users.length > 0 && (
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
                      <div className="divide-y">
                        {results.posts.map((post) => (
                          <PostItem key={post.id} post={post} isAdmin={false} />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            {!isHashtagSearch && (
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
            )}

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
                    <PostItem key={post.id} post={post} isAdmin={false} />
                  ))}
                </div>
              )}
            </TabsContent>

            {results.hashtags.length > 0 && (
              <TabsContent value="hashtags">
                {isLoading ? (
                  <div className="p-8 text-center">
                    <div className="inline-block animate-spin h-8 w-8 border-4 border-gray-300 border-t-blue-500 rounded-full"></div>
                  </div>
                ) : results.hashtags.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    No hashtags found for "{query}"
                  </div>
                ) : (
                  <div className="divide-y">
                    {results.hashtags.map((hashtag) => (
                      <HashtagItem key={hashtag.name} hashtag={hashtag} />
                    ))}
                  </div>
                )}
              </TabsContent>
            )}
          </Tabs>
        </>
      ) : (
        <div className="p-8 text-center text-gray-500">
          Enter a search term to find users and posts. Try searching for
          #hashtags too!
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

function HashtagItem({ hashtag }) {
  return (
    <Link
      href={`/search?q=${encodeURIComponent(hashtag.name)}`}
      className="flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-800"
    >
      <div className="h-10 w-10 mr-3 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
        <Hash className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      </div>
      <div>
        <div className="font-medium">{hashtag.name}</div>
        <div className="text-sm text-gray-500">
          {hashtag.postCount} {hashtag.postCount === 1 ? "post" : "posts"}
        </div>
      </div>
    </Link>
  );
}
