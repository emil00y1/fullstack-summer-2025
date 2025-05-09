"use client";
import React from 'react';
import SearchField from '@/components/ui/SearchField';
import TrendingHashtags from '@/components/ui/TrendingHashtags';
import WhoToFollow from '@/components/ui/WhoToFollow';


const SidebarRight = () => {
    return (
      <div className="w-80 p-4 border-l border-gray-200 dark:border-gray-800 h-screen">
        <SearchField />
        <TrendingHashtags />
        <WhoToFollow />
      </div>
    );
  };
  
  export default SidebarRight;