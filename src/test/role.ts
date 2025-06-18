import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// function to manually add role for supabase user_metadata for admin initialization and for testing only
async function main() {
  const { data, error } = await supabase.auth.admin.updateUserById(
    "ac09707f-bf5d-48f3-bdb7-4ad73bcabfb8", // get id manually from supabase
    {
      user_metadata: {
        user_role: "admin", // edit role here
      },
    }
  );

  if (error) {
    console.error("Error creating user:", error);
  } else {
    console.log("User created successfully:", data);
  }
}

main();
