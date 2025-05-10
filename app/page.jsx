import Feed from "@/components/Feed";

export default async function Page() {
  return (
    <div className="  min-h-screen pb-20 font-[family-name:var(--font-geist-sans)]">
      <div className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Feed />
      </div>
    </div>
  );
}
