import AdminLayout from "../../../components/layouts/admin/AdminLayout";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.user_role !== "admin") {
    redirect("/unauthorized");
  }

  return <AdminLayout>{children}</AdminLayout>;
}
