import { Avatar } from "@radix-ui/react-avatar";
import { AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";

const WhoToFollow = () => {
  const suggestedUsers = [
    {
      id: 1,
      name: "Tech Insider",
      handle: "@techinsider",
    },
    {
      id: 2,
      name: "NASA",
      handle: "@NASA",
    },
    {
      id: 3,
      name: "Dev Community",
      handle: "@devcomm",
    },
  ];

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 mb-4">
      <h2 className="font-bold text-xl mb-4">Who to follow</h2>
      <div className="space-y-4">
        {suggestedUsers.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={user?.avatar || "https://picsum.photos/200"}
                  alt={user?.name || "User"}
                />
                <AvatarFallback>
                  {user?.name?.[0]?.toUpperCase() || "U"}
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
        ))}
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
