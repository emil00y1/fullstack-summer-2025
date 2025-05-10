import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
  Home,
  Search,
  Bell,
  Mail,
  User,
  Menu,
} from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

import Logo from "./Logo";
import SidebarProfileFooter from "./SideBarProfileFooter";
import { MobileSidebar } from "./MobileSidebar";

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
  const MainSidebarContent = () => (
    <>
      <SidebarContent className="p-1">
        <SidebarMenu className="flex flex-col gap-4">
          <SidebarMenuItem>
            <SidebarMenuButton className="hover:bg-transparent">
              <Link href="/" className="p-1">
                <Logo
                  height={20}
                  width={20}
                  alt="Y logo"
                  className="fill-primary"
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
                    <div className="w-5 h-5 flex items-center justify-center md:mr-2 lg:mr-2">
                      <IconComponent className="w-full h-full" />
                    </div>
                    <span className="lg:inline hidden">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
          <Button className="rounded-3xl max-w-52 font-bold cursor-pointer mt-4 min-w-0 flex items-center justify-center w-12 h-12 p-0 lg:w-auto lg:h-auto lg:p-4 lg:max-w-52">
            <span className="lg:inline hidden">Post</span>
            <span className="lg:hidden inline font-bold text-lg">+</span>
          </Button>
        </SidebarMenu>
      </SidebarContent>
      <SidebarProfileFooter />
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
        <Sidebar {...props} className="fixed w-16 lg:w-64 transition-all duration-300">
          <MainSidebarContent />
        </Sidebar>

    </>
  );
}

export default SideBar;