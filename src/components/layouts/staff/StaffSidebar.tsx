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
import { useAuth } from "../../provider/auth-provider";

export function StaffSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { user, loading } = useAuth();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavHeader title="Staff Sidebar" />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={staffNavs} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            email: user?.email || "",
            name: `${user?.user_metadata?.firstName || ""} ${
              user?.user_metadata?.lastName || ""
            }`,
            avatar: "https://github.com/shadcn.png",
          }}
          loading={loading}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
