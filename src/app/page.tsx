import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

const HomePage = async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  if (user.user_metadata.user_role === "admin") {
    return redirect("/admin-dashboard");
  } else if (user.user_metadata.user_role === "staff") {
    return redirect("/staff-dashboard");
  }

  return redirect("/login");
};

export default HomePage;
