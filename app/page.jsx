import { ThemeToggle } from "../components/ThemeToggle";
import Feed from "@/components/Feed";

// async function getUsers() {
//   const db = require("@/lib/db");
//   const users = await db.executeQuery("SELECT * FROM users");
//   return users;
// }

export default async function Home() {
  // const users = await getUsers();

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <ThemeToggle />
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Feed />
      </main>
    </div>
  );
}
