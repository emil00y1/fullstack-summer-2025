import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { executeQuery } from "@/lib/db";
import Link from "next/link";
import FollowButton from "../FollowButton";

async function ProfileInfo({
  userData,
  isOwnAccount = false,
  isFollowing = false,
}) {
  const followerCount = await executeQuery(
    `SELECT COUNT(*) as count FROM follows WHERE following_id = ?`,
    [userData.id]
  );
  const followingCount = await executeQuery(
    `SELECT COUNT(*) as count FROM follows WHERE follower_id = ?`,
    [userData.id]
  );

  return (
    <>
      <div className="relative">
        <div className="h-32 bg-gray-200">
          <Image
            src={userData.cover || "https://placehold.co/600x400.png"}
            alt="Cover"
            className="w-full h-full object-cover"
            width={600}
            height={400}
          />
        </div>

        {/* Profile avatar using Avatar component */}
        <div className="absolute -bottom-12 left-4">
          <Avatar className="h-24 w-24">
            <AvatarImage
              src={userData.avatar}
              alt={userData.username || "Profile"}
              className="w-full h-full object-cover"
            />
            <AvatarFallback className="text-2xl">
              {userData.username?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="absolute right-4 bottom-4">
          {isOwnAccount ? (
            <Link href="/profile/edit">
              <Button variant="outline" className="rounded-full cursor-pointer">
                Edit profile
              </Button>
            </Link>
          ) : (
            <FollowButton
              userId={userData.id}
              initialIsFollowing={isFollowing}
            />
          )}
        </div>
      </div>
      {/* Profile info */}
      <div className="mt-14 px-4">
        <h2 className="font-bold text-xl">{userData.username}</h2>
        <p className="text-gray-500">@{userData.username}</p>

        {/* Bio */}
        <p className="mt-2">{userData.bio || "No bio yet"}</p>

        <div className="flex flex-wrap gap-4 mt-2 text-gray-500 text-sm">
          <span>
            Joined&nbsp;
            {userData.createdAt
              ? new Date(userData.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })
              : "recently"}
          </span>
        </div>

        {/* Following/Followers */}
        <div className="flex gap-4 mt-2">
          <span>
            <span className="font-semibold">
              {followingCount[0]?.count || 0}
            </span>
            <span className="text-gray-500">&nbsp;Following</span>
          </span>
          <span>
            <span className="font-semibold">
              {followerCount[0]?.count || 0}
            </span>
            <span className="text-gray-500">&nbsp;Followers</span>
          </span>
        </div>
      </div>
    </>
  );
}

export default ProfileInfo;
