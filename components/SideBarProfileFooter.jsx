import {
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  MoreHorizontal,
  LogOut,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { auth, signOut } from "@/auth"
import { Button } from "./ui/button";
import { ThemeToggle } from "./ThemeToggle";


export default async function SidebarProfileFooter(){

  const session = await auth()
    return (
<SidebarFooter className="p-4">
        {session ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="cursor-pointer">
              <button className="w-full flex items-center justify-between p-2 rounded-full hover:bg-gray-100 dark:hover:bg-input/50 transition-colors focus:outline-none">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src="https://github.com/shadcn.png"
                      alt="Profile"
                    />
                    <AvatarFallback>
                      {session.user?.name?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <span className="font-medium text-sm">
                      {session.user?.name}
                    </span>
                    <span className="text-gray-500 text-xs">
                      @{session.user?.email?.split("@")[0]}
                    </span>
                  </div>
                </div>
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>
                    <ThemeToggle />
                </DropdownMenuItem>
                <DropdownMenuItem className="p-0">
                    <form className="w-full h-full"
                        action={async () => {
                            "use server"
                            await signOut()
                        }}
                        >
                            <Button type="submit" variant="ghost" className="cursor-pointer w-full h-full justify-start"><LogOut className="mr-2 h-4 w-4" /><span>Sign Out</span></Button>
                    </form>
                </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="text-center text-gray-500">Not logged in</div>
        )}
      </SidebarFooter>
)}
