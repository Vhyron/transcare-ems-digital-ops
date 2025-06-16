"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../utils/supabase/server";
import { redirect } from "next/navigation";

export async function login(data: { email: string; password: string }) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    console.error("Login Error: ", error);
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
