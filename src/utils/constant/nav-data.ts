import {
  Bus,
  ClipboardList,
  FilePlus,
  FileText,
  Grid2X2,
  Users2,
} from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isPage?: boolean;
}

export interface NavItem {
  title: string;
  url: string;
  icon?: any;
  isActive?: boolean;
  items?: NavItem[];
  breadcrumbs?: BreadcrumbItem[];
}

export const adminNavs: NavItem[] = [
  {
    title: "Dashboard",
    url: "/admin-dashboard",
    icon: Grid2X2,
    breadcrumbs: [{ label: "Dashboard", isPage: true }],
  },
  {
    title: "Staff Management",
    icon: Users2,
    url: "/staff",
    items: [
      {
        title: "All Staff",
        url: "/staff",
        breadcrumbs: [
          { label: "Staff Management" },
          { label: "All Staff", isPage: true },
        ],
      },
      {
        title: "Add Staff",
        url: "/staff/new",
        breadcrumbs: [
          { label: "Staff Management" },
          { label: "All Staff", href: "/staff" },
          { label: "Add Staff", isPage: true },
        ],
      },
      {
        title: "Roles & Permissions",
        url: "/staff/roles",
        breadcrumbs: [
          { label: "Staff Management" },
          { label: "All Staff", href: "/staff" },
          { label: "Roles & Permissions", isPage: true },
        ],
      },
    ],
  },
  {
    title: "Form Approvals",
    icon: FileText,
    url: "/forms",
    items: [
      {
        title: "Pending Forms",
        url: "/forms/pending",
        breadcrumbs: [
          { label: "Form Approvals" },
          { label: "Pending Forms", isPage: true },
        ],
      },
      {
        title: "Reviewed Forms",
        url: "/forms/reviewed",
        breadcrumbs: [
          { label: "Form Approvals" },
          { label: "Reviewed Forms", isPage: true },
        ],
      },
    ],
  },
];

export const staffNavs: NavItem[] = [
  {
    title: "Dashboard",
    url: "/staff-dashboard",
    icon: Grid2X2,
    isActive: true,
    breadcrumbs: [{ label: "Dashboard", isPage: true }],
  },
  {
    title: "Operations",
    icon: ClipboardList,
    url: "/operations",
    items: [
      {
        title: "Dispatch Form",
        url: "/operations/dispatch-form",
        breadcrumbs: [
          { label: "Operations" },
          { label: "Dispatch Form", isPage: true },
        ],
      },
      {
        title: "Census Record",
        url: "/operations/census-record",
        breadcrumbs: [
          { label: "Operations" },
          { label: "Census Record", isPage: true },
        ],
      },
    ],
  },
  {
    title: "Trip Tickets",
    icon: Bus,
    url: "/trip-tickets",
    items: [
      {
        title: "Hospital Trip Ticket",
        url: "/trip-tickets/hospital",
        breadcrumbs: [
          { label: "Trip Tickets" },
          { label: "Hospital Trip Ticket", isPage: true },
        ],
      },
    ],
  },
  {
    title: "More Forms",
    icon: FilePlus,
    url: "/forms",
    items: [
      {
        title: "New Form A",
        url: "/forms/new-form-a",
        breadcrumbs: [
          { label: "More Forms" },
          { label: "New Form A", isPage: true },
        ],
      },
      {
        title: "New Form B",
        url: "/forms/new-form-b",
        breadcrumbs: [
          { label: "More Forms" },
          { label: "New Form B", isPage: true },
        ],
      },
    ],
  },
];
