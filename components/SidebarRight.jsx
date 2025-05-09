"use client";
import React from 'react';
import SearchField from '@/components/SearchField';
import TrendingHashtags from '@/components/TrendingHashtags';
import WhoToFollow from '@/components/WhoToFollow';


const SidebarRight = () => {
    return (
      <div className="w-80 p-4 border-l border-gray-200 dark:border-gray-800 h-screen">
        <div className="fixed">
          <SearchField />
          <TrendingHashtags />
          <WhoToFollow />
        </div>
      </div>
    );
  };
  
  export default SidebarRight;