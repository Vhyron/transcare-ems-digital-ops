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
import { adminNavs } from "../../../utils/constant/nav-data";

const data = {
  user: {
    name: "Admin",
    email: "admin@transcare.ph",
    avatar: "https://github.com/admin-avatar.png",
  },
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
        <NavMain items={adminNavs} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
