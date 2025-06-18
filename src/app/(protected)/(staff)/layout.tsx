import StaffLayout from "../../../components/layouts/staff/StaffLayout";

export default function StaffRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StaffLayout>{children}</StaffLayout>;
}
