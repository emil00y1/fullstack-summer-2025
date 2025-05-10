const TrendingHashtags = () => {
    const trends = [
      { 
        id: 1, 
        category: 'Technology', 
        hashtag: '#NextJS', 
        posts: '25.4K' 
      },
      { 
        id: 2, 
        category: 'Sports', 
        hashtag: '#WorldCup', 
        posts: '340K' 
      },
      { 
        id: 3, 
        category: 'Politics', 
        hashtag: '#Election2025', 
        posts: '120K' 
      },
      { 
        id: 4, 
        category: 'Entertainment', 
        hashtag: '#MovieNight', 
        posts: '45.2K' 
      },
      { 
        id: 5, 
        category: 'Science', 
        hashtag: '#SpaceX', 
        posts: '95.1K' 
      }
    ];
  
    return (
      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 mb-4">
        <h2 className="font-bold text-xl mb-4">Trends for you</h2>
        <div className="space-y-4">
          {trends.map(trend => (
            <div key={trend.id} className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 -mx-2 px-2 py-1 rounded">
              <p className="text-gray-500 text-xs">{trend.category} · Trending</p>
              <p className="font-bold text-sm">{trend.hashtag}</p>
              <p className="text-gray-500 text-xs">{trend.posts} posts</p>
            </div>
          ))}
        </div>
        <button className="text-blue-500 text-sm mt-4 hover:underline">
          Show more
        </button>
      </div>
    );
  };

export default TrendingHashtags;