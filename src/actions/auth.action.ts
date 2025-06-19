"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../lib/supabase/server";
import { redirect } from "next/navigation";

export async function login(data: { email: string; password: string }) {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.signInWithPassword(data);

  if (error) {
    console.error("Login Error: ", error);
    return { error: error.message };
  }

  revalidatePath("/", "layout");

  if (user?.user_metadata?.user_role === "admin") {
    redirect("/admin-dashboard");
  } else if (user?.user_metadata?.user_role === "staff") {
    redirect("/staff-dashboard");
  }
}

export async function logout() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Logout Error: ", error);
    return error;
  }

  revalidatePath("/", "layout");
  redirect("/");
}
