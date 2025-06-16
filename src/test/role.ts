import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// function to manually add role for supabase user_metadata for testing only
async function main() {
  const { data, error } = await supabase.auth.admin.updateUserById(
    "bc7a5dea-2792-4f08-996b-d0bff6e4f5e6", // get id manually from supabase
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
