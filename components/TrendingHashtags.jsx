"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const TrendingHashtags = () => {
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchTrendingHashtags();
  }, []);

  const fetchTrendingHashtags = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/trending/hashtags?limit=5");

      if (!response.ok) {
        throw new Error("Failed to fetch trending hashtags");
      }

      const data = await response.json();
      setTrends(data);
    } catch (err) {
      console.error("Error fetching trending hashtags:", err);
      setError(err.message);
      // Fallback to demo data if API fails
      setTrends([
        {
          hashtag: "#javascript",
          category: "Technology",
          posts: "25.4K",
        },
        {
          hashtag: "#react",
          category: "Technology",
          posts: "18.2K",
        },
        {
          hashtag: "#webdev",
          category: "Technology",
          posts: "12.8K",
        },
        {
          hashtag: "#coding",
          category: "Technology",
          posts: "31.5K",
        },
        {
          hashtag: "#ai",
          category: "Technology",
          posts: "45.1K",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleHashtagClick = (hashtag) => {
    router.push(`/search?q=${encodeURIComponent(hashtag)}`);
  };

  const formatPostCount = (count) => {
    if (typeof count === "string") return count;

    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  if (loading) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 mb-4">
        <h2 className="font-bold text-xl mb-4">Trends for you</h2>
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-1"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-1"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 mb-4">
      <h2 className="font-bold text-xl mb-4">Trends for you</h2>

      {error && (
        <div className="text-sm text-amber-600 dark:text-amber-400 mb-2">
          Using cached data (API unavailable)
        </div>
      )}

      <div className="space-y-4">
        {trends.length > 0 ? (
          trends.map((trend, index) => (
            <div
              key={index}
              className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 -mx-2 px-2 py-1 rounded transition-colors"
              onClick={() => handleHashtagClick(trend.hashtag)}
            >
              <p className="text-gray-500 text-xs">
                {trend.category} · Trending
              </p>
              <p className="font-bold text-sm text-blue-600 dark:text-blue-400 hover:underline">
                {trend.hashtag}
              </p>
              <p className="text-gray-500 text-xs">
                {formatPostCount(trend.posts)} posts
              </p>
            </div>
          ))
        ) : (
          <div className="text-gray-500 text-sm py-4 text-center">
            No trending hashtags available
          </div>
        )}
      </div>

      <button
        className="text-blue-500 text-sm mt-4 hover:underline"
        onClick={() => router.push("/search")}
      >
        Show more
      </button>
    </div>
  );
};

export default TrendingHashtags;
