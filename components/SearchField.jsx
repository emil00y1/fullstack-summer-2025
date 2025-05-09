import React, { useState } from 'react';
import { Search } from 'lucide-react';

const SearchField = () => {
    const [searchQuery, setSearchQuery] = useState('');
    
    return (
      <div className="relative mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-gray-500" />
          </div>
          <input
            type="text"
            className="bg-gray-100 dark:bg-gray-800 w-full py-2 pl-10 pr-4 rounded-full border-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Search Twitter"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
    );
  };

export default SearchField;