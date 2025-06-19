import { BaseDashboardLayout } from "../BaseDashboardLayout";
import { StaffSidebar } from "./StaffSidebar";

interface Props {
  children: React.ReactNode;
}

export default function StaffLayout({ children }: Props) {
  return (
    <BaseDashboardLayout sidebar={<StaffSidebar />}>
      {children}
    </BaseDashboardLayout>
  );
}
