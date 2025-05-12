import BackButton from "../BackButton";

function ProfileHeader({ username, postsAmount }) {
  return (
    <div className="flex items-center p-4 border-b">
      <BackButton />
      <div>
        <h1 className="text-xl font-bold">{username}</h1>
        <p className="text-gray-500 text-sm">{postsAmount} posts</p>
      </div>
    </div>
  );
}

export default ProfileHeader;
