'use client';

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";

const WhoToFollow = () => {
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users/suggestions');
        if (!response.ok) {
          throw new Error('Failed to fetch user suggestions');
        }
        const data = await response.json();
        setSuggestedUsers(data);
      } catch (error) {
        console.error('Error fetching suggested users:', error);
        // Fallback to demo data if API fails
        setSuggestedUsers([
          {
            id: '1',
            name: 'Loading Failed',
            handle: '@tryagain',
            avatar: null
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 mb-4">
      <h2 className="font-bold text-xl mb-4">Who to follow</h2>
      <div className="space-y-4">
        {loading ? (
          // Show loading skeletons
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-2 animate-pulse">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                <div>
                  <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-2 w-16 bg-gray-200 dark:bg-gray-700 rounded mt-2"></div>
                </div>
              </div>
              <div className="h-8 w-16 rounded-full bg-gray-200 dark:bg-gray-700"></div>
            </div>
          ))
        ) : (
          suggestedUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={user.avatar || `https://api.dicebear.com/6.x/avataaars/svg?seed=${user.name}`}
                    alt={user.name || "User"}
                  />
                  <AvatarFallback>
                    {user.name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold text-sm">{user.name}</p>
                  <p className="text-gray-500 text-sm">{user.handle}</p>
                </div>
              </div>
              <Button className="bg-black dark:bg-white text-white dark:text-black font-bold text-sm rounded-full">
                Follow
              </Button>
            </div>
          ))
        )}
      </div>
      <Button
        className="text-blue-500 text-sm mt-4 hover:underline pl-0 hover:bg-transparent dark:hover:bg-transparent cursor-pointer"
        variant="ghost"
      >
        Show more
      </Button>
    </div>
  );
};

export default WhoToFollow;