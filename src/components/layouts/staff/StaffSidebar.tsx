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
import { staffNavs } from "../../../utils/constant/nav-data";

const data = {
  user: {
    name: "Staff",
    email: "staff@transcare.ph",
    avatar: "https://github.com/admin-avatar.png",
  },
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
        <NavMain items={staffNavs} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
