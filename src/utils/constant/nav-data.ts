import {
  Bus,
  ClipboardList,
  FilePlus,
  FileText,
  Grid2X2,
  Users2,
} from "lucide-react";

export const adminNavs = [
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
        title: "Add Staff",
        url: "/staff/new",
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
];

export const staffNavs = [
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
];
