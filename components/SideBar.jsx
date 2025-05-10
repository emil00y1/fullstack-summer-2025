import {
  Sidebar,
  SidebarContent,
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
} from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

import Logo from "./Logo";
import SidebarProfileFooter from "./SideBarProfileFooter";

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
    url: "/profile",
    icon: User,
  },
];

export function SideBar({ ...props }) {

  return (
    <Sidebar {...props} className="fixed">
      <SidebarHeader className="p-1"></SidebarHeader>
      <SidebarContent className="p-1">
        <SidebarMenu className="flex flex-col gap-4">
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
                  className="text-lg p-3 rounded-3xl"
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
          <Button className="rounded-3xl font-bold cursor-pointer mt-4 max-w-52">
            Post
          </Button>
        </SidebarMenu>
      </SidebarContent>
      <SidebarProfileFooter/>
      <SidebarRail />
    </Sidebar>
  );
}

export default SideBar;
