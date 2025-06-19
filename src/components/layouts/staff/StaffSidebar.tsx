"use client";

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
import { Bus, ClipboardList, FilePlus, Grid2X2 } from "lucide-react";

const data = {
  user: {
    name: "Staff",
    email: "staff@transcare.ph",
    avatar: "https://github.com/admin-avatar.png",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/staff-dashboard",
      icon: Grid2X2,
      isActive: true,
    },
    {
      title: "Operations",
      icon: ClipboardList,
      items: [
        {
          title: "Dispatch Form",
          url: "/operations/dispatch-form",
        },
        {
          title: "Census Record",
          url: "/operations/census-record",
        },
      ],
    },
    {
      title: "Trip Tickets",
      icon: Bus,
      items: [
        {
          title: "Hospital Trip Ticket",
          url: "/trip-tickets/hospital",
        },
      ],
    },
    {
      title: "More Forms",
      icon: FilePlus,
      items: [
        {
          title: "New Form A",
          url: "/forms/new-form-a",
        },
        {
          title: "New Form B",
          url: "/forms/new-form-b",
        },
      ],
    },
  ],
};

export function StaffSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavHeader title="Staff Sidebar" />
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
