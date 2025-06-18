import { BaseDashboardLayout } from "../BaseDashboardLayout";
import { StaffSidebar } from "./StaffSidebar";

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

export default function StaffLayout({ children, breadcrumbs }: Props) {
  return (
    <BaseDashboardLayout sidebar={<StaffSidebar />} breadcrumbs={breadcrumbs}>
      {children}
    </BaseDashboardLayout>
  );
}
