import { BaseDashboardLayout } from "../BaseDashboardLayout";
import { AdminSidebar } from "./AdminSidebar";

interface Props {
  children: React.ReactNode;
  breadcrumbs?: {
    items: Array<{
      label: string;
      href?: string;
      isPage?: boolean;
    }>;
  };
}

export default function AdminLayout({ children, breadcrumbs }: Props) {
  return (
    <BaseDashboardLayout sidebar={<AdminSidebar />} breadcrumbs={breadcrumbs}>
      {children}
    </BaseDashboardLayout>
  );
}
