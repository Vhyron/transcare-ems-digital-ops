import { BaseDashboardLayout } from "../BaseDashboardLayout";
import { AdminSidebar } from "./AdminSidebar";

interface Props {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: Props) {
  return (
    <BaseDashboardLayout sidebar={<AdminSidebar />} userRole="admin">
      {children}
    </BaseDashboardLayout>
  );
}
