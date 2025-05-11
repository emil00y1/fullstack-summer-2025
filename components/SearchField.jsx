'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, User, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const SearchField = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ users: [], posts: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const router = useRouter();

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Debounce search to avoid too many requests
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length > 1) {
        performSearch(searchQuery);
      } else {
        setSearchResults({ users: [], posts: [] });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const performSearch = async (query) => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Search failed');
      
      const data = await response.json();
      setSearchResults(data);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    // Handle Enter key to go to search results page
    if (e.key === 'Enter' && searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowResults(false);
    }
  };

  const handleSearchFocus = () => {
    if (searchQuery.trim().length > 1) {
      setShowResults(true);
    }
  };

  const renderResults = () => {
    const { users, posts } = searchResults;
    const hasResults = users.length > 0 || posts.length > 0;

    if (isLoading) {
      return (
        <div className="p-2 text-center text-gray-500">
          Searching...
        </div>
      );
    }

    if (!hasResults) {
      return (
        <div className="p-3 text-center text-gray-500">
          No results found
        </div>
      );
    }

    return (
      <>
        {/* Users section */}
        {users.length > 0 && (
          <div className="mb-2">
            <div className="px-3 py-1 text-xs font-semibold text-gray-500 bg-gray-50 dark:bg-gray-800">
              People
            </div>
            {users.map(user => (
              <Link
                href={`/user/${user.username}`}
                key={user.id}
                className="flex items-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => setShowResults(false)}
              >
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage
                    src={user.avatar || `https://api.dicebear.com/6.x/avataaars/svg?seed=${user.username}`}
                    alt={user.username}
                  />
                  <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">@{user.username}</div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Posts section */}
        {posts.length > 0 && (
          <div>
            <div className="px-3 py-1 text-xs font-semibold text-gray-500 bg-gray-50 dark:bg-gray-800">
              Posts
            </div>
            {posts.map(post => (
              <Link
                href={`/posts/${post.id}`}
                key={post.id}
                className="flex items-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => setShowResults(false)}
              >
                <MessageSquare className="h-4 w-4 mr-2 text-gray-500" />
                <div>
                  <div className="line-clamp-1">{post.content}</div>
                  <div className="text-xs text-gray-500">@{post.username}</div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* View all results */}
        <div className="border-t">
          <Link
            href={`/search?q=${encodeURIComponent(searchQuery)}`}
            className="block px-4 py-2 text-center text-blue-500 hover:bg-gray-50 dark:hover:bg-gray-800"
            onClick={() => setShowResults(false)}
          >
            View all results
          </Link>
        </div>
      </>
    );
  };

  return (
    <div className="relative mb-4" ref={searchRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-4 w-4 text-gray-500" />
        </div>
        <input
          type="text"
          className="bg-gray-100 dark:bg-gray-800 w-full py-2 pl-10 pr-4 rounded-full border-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="Search posts and users"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleSearchFocus}
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <div className="animate-spin h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      {/* Search results dropdown */}
      {showResults && searchQuery.trim().length > 1 && (
        <div className="absolute mt-1 w-full bg-white dark:bg-gray-900 rounded-md shadow-lg border divide-y z-10 max-h-96 overflow-auto">
          {renderResults()}
        </div>
      )}
    </div>
  );
};

export default SearchField;