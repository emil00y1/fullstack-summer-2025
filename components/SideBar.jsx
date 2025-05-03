import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import Image from "next/image";
import Link from "next/link";

// This is sample data.
const data = [
  {
    title: "Home",
    url: "/",
  },
  {
    title: "Explore",
    url: "#",
  },
  {
    title: "Notifications",
    url: "#",
  },
  {
    title: "Messages",
    url: "#",
  },
  {
    title: "Profile",
    url: "#",
  },
];

export function SideBar({ ...props }) {
  return (
    <Sidebar {...props}>
      <SidebarHeader className="p-4">
        <Link href="/" className="p-1">
          <Image src="/logo-y.svg" height={16} width={16} alt="Y logo" />
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-4">
        {/* We create a SidebarGroup for each parent. */}
        <SidebarMenu className="flex flex-col gap-4">
          {data.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={item.isActive}
                className="text-lg"
              >
                <a href={item.url}>{item.title}</a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
