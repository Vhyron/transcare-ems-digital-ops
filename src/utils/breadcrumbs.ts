import { adminNavs, staffNavs } from "./constant/nav-data";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isPage?: boolean;
}

export interface NavItem {
  title: string;
  url?: string;
  icon?: any;
  isActive?: boolean;
  items?: NavItem[];
  breadcrumbs?: BreadcrumbItem[];
}

function findBreadcrumbsByUrl(
  items: NavItem[],
  targetUrl: string
): BreadcrumbItem[] | null {
  for (const item of items) {
    if (item.url === targetUrl && item.breadcrumbs) {
      return item.breadcrumbs;
    }
    if (item.items) {
      const found = findBreadcrumbsByUrl(item.items, targetUrl);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

/**
 * Generates breadcrumbs based on the current pathname
 * @param pathname - Current page pathname
 * @param userRole - User role ('admin' or 'staff')
 * @returns Array of breadcrumb items
 */
export function generateBreadcrumbs(
  pathname: string,
  userRole: "admin" | "staff"
): BreadcrumbItem[] {
  const navData = userRole === "admin" ? adminNavs : staffNavs;
  const breadcrumbs = findBreadcrumbsByUrl(navData, pathname);
  return breadcrumbs || [];
}
