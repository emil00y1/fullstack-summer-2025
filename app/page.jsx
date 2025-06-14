import { auth } from "@/auth";
import Feed from "@/components/Feed";
import LandingPage from "@/components/LandingPage";
import { executeQuery } from "@/lib/db";

export default async function Page() {
  const session = await auth();
  
  // If user is not authenticated, show landing page
  if (!session) {
    return <LandingPage />;
  }

  // If user is authenticated, show the feed
  const currentUserId = session?.user?.id || null;

  let isAdmin = false;
  if (currentUserId) {
    const adminCheck = await executeQuery(
      `SELECT 1 FROM user_roles ur 
       JOIN roles r ON ur.role_id = r.id 
       WHERE ur.user_id = ? AND r.name = 'admin'
       LIMIT 1`,
      [currentUserId]
    );
    isAdmin = adminCheck.length > 0;
  }

  return (
    <div className="min-h-screen pb-20 font-[family-name:var(--font-geist-sans)]">
      <div className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Feed isAdmin={isAdmin} />
      </div>
    </div>
  );
}