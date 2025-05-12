import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Home, Search, Bell, Mail, User } from "lucide-react";
import Link from "next/link";
import Logo from "./Logo";
import SidebarProfileFooter from "./SideBarProfileFooter";
import PostDialog from "./PostDialog";

const data = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Explore",
    url: "/search",
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
        <SidebarMenu className="flex flex-col gap-4 items-center lg:items-start">
          <SidebarMenuItem>
            <SidebarMenuButton className="hover:bg-transparent justify-center lg:justify-start">
              <Link href="/" className="p-1 ">
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
                  <Link
                    href={item.url}
                    className="py-4 justify-center lg:justify-start"
                  >
                    <div className="w-5 h-5 flex items-center justify-center lg:mr-2">
                      <IconComponent className="w-full h-full" />
                    </div>
                    <span className="lg:inline hidden">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
          <PostDialog />
        </SidebarMenu>
      </SidebarContent>
      <SidebarProfileFooter />
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <Sidebar
        {...props}
        className="fixed w-16 lg:w-64 transition-all duration-300"
      >
        <MainSidebarContent />
      </Sidebar>
    </>
  );
}

export default SideBar;
