import * as React from "react";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  LayoutDashboardIcon,
  ListIcon,
  ChartBarIcon,
  FileChartColumnIcon,
  CameraIcon,
  FileTextIcon,
} from "lucide-react";
import { SerabLogoIcon } from "@/components/serab-logo";

const data = {
  user: {
    name: "Admin Serab Coffee",
    email: "admin@serabcoffee.com",
    avatar: "",
  },
  navMain: [
    {
      title: "DashBoard",
      url: "/",
      icon: <LayoutDashboardIcon />,
    },
    {
      title: "Kelola Menu",
      url: "/menu",
      icon: <ListIcon />,
    },
    {
      title: "Riwayat Pesanan",
      url: "/riwayat",
      icon: <ChartBarIcon />,
    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: <CameraIcon />,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: <FileTextIcon />,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: <FileTextIcon />,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],

  documents: [
    
    {
      name: "Reports",
      url: "/report",
      icon: <FileChartColumnIcon />,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-2! hover:bg-sidebar-accent/60 transition-colors"
            >
              <a href="#" className="flex items-center gap-2.5">
                <SerabLogoIcon height={28} onDark={true} />
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-extrabold tracking-wider text-[#F5E6D3]">SERAB COFFEE</span>
                  <span className="text-[10px] text-[#F5E6D3]/75 font-serif italic tracking-wide">feel the deLIGHT</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
