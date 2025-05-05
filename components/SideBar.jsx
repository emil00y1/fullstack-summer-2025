import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  Home,
  Search,
  Bell,
  Mail,
  User,
  MoreHorizontal,
  LogOut,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import Logo from "./Logo";

const data = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Explore",
    url: "#",
    icon: Search,
  },
  {
    title: "Notifications",
    url: "#",
    icon: Bell,
  },
  {
    title: "Messages",
    url: "#",
    icon: Mail,
  },
  {
    title: "Profile",
    url: "#",
    icon: User,
  },
];

export function SideBar({ ...props }) {
  return (
    <Sidebar {...props} className="max-w-[275px]">
      <SidebarHeader className="p-1"></SidebarHeader>
      <SidebarContent className="p-1">
        <SidebarMenu className="flex flex-col gap-3">
          <SidebarMenuItem>
            <SidebarMenuButton className="hover:bg-transparent">
              <Link href="/" className="p-1">
                <Logo
                  height={20}
                  width={20}
                  alt="Y logo"
                  className="fill-primary" // This sets colors for light/dark mode
                />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {data.map((item) => {
            const IconComponent = item.icon;
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={item.isActive}
                  className="text-base p-3 rounded-3xl"
                >
                  <Link href={item.url} className="py-4">
                    <div className="w-5 h-5 flex items-center justify-center mr-2">
                      <IconComponent className="w-full h-full" />
                    </div>
                    {item.title}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
          <Button className="rounded-3xl py-2 font-bold cursor-pointer mt-4">
            Post
          </Button>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild className="cursor-pointer">
            <button className="w-full flex items-center justify-between p-2 rounded-full hover:bg-gray-100 dark:hover:bg-input/50 transition-colors focus:outline-none">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src="https://github.com/shadcn.png"
                    alt="Profile"
                  />
                  <AvatarFallback>A</AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <span className="font-medium text-sm">Lime</span>
                  <span className="text-gray-500 text-xs">@musicbylime</span>
                </div>
              </div>
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
