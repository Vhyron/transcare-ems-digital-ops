"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../lib/supabase/server";
import { redirect } from "next/navigation";
import { NewStaffFormData } from "../components/forms/NewStaffForm";
import { updateUser } from "./users.action";

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

export async function registerStaff(data: NewStaffFormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.signUp({
    email: data.email,
    password: data.confirmPassword,
    options: {
      data: {
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        user_role: "staff",
      },
    },
  });

  if (error) {
    console.error("Signup Error: ", error);
    return { error: error.message, data: null };
  }

  if (user && data.firstName && data.lastName) {
    const updatedUser = await updateUser(user.id, {
      first_name: data.firstName,
      last_name: data.lastName,
    });

    if (updatedUser?.error) {
      return { error: "User created but failed to add metadata", data: null };
    }
  }

  revalidatePath("/", "layout");

  return { data: user, error: null };
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
