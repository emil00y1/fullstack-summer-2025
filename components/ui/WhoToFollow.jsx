const WhoToFollow = () => {
    const suggestedUsers = [
      { 
        id: 1, 
        name: 'Tech Insider', 
        handle: '@techinsider', 
        avatar: '/api/placeholder/32/32'
      },
      { 
        id: 2, 
        name: 'NASA', 
        handle: '@NASA', 
        avatar: '/api/placeholder/32/32'
      },
      { 
        id: 3, 
        name: 'Dev Community', 
        handle: '@devcomm', 
        avatar: '/api/placeholder/32/32'
      }
    ];
  
    return (
      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 mb-4">
        <h2 className="font-bold text-xl mb-4">Who to follow</h2>
        <div className="space-y-4">
          {suggestedUsers.map(user => (
            <div key={user.id} className="flex items-center justify-between">
              <div className="flex items-center">
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <p className="font-bold text-sm">{user.name}</p>
                  <p className="text-gray-500 text-sm">{user.handle}</p>
                </div>
              </div>
              <button className="bg-black dark:bg-white text-white dark:text-black font-bold text-sm px-4 py-1 rounded-full">
                Follow
              </button>
            </div>
          ))}
        </div>
        <button className="text-blue-500 text-sm mt-4 hover:underline">
          Show more
        </button>
      </div>
    );
  };

export default WhoToFollow;