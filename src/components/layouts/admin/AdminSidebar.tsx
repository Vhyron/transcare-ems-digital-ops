"use client";

import { FileText, Grid2X2, Users2 } from "lucide-react";
import * as React from "react";

import { NavMain } from "@/components/layouts/sidebar-components/nav-main";
import { NavUser } from "@/components/layouts/sidebar-components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import NavHeader from "../sidebar-components/nav-header";

// This is sample data.
const data = {
  user: {
    name: "Admin",
    email: "admin@transcare.ph",
    avatar: "https://github.com/admin-avatar.png",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/admin-dashboard",
      icon: Grid2X2,
    },
    {
      title: "Staff Management",
      url: "/staff",
      icon: Users2,
      items: [
        {
          title: "All Staff",
          url: "/staff",
        },
        {
          title: "Roles & Permissions",
          url: "/staff/roles",
        },
      ],
    },
    {
      title: "Form Approvals",
      icon: FileText,
      items: [
        {
          title: "Pending Forms",
          url: "/forms/pending",
        },
        {
          title: "Reviewed Forms",
          url: "/forms/reviewed",
        },
      ],
    },
  ],
};

export function AdminSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavHeader />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
