import { supabaseAdmin } from '../lib/supabase/admin_client';

// function to manually add role for supabase user_metadata for admin initialization and for testing only
async function main() {
  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
    'b55771ce-442d-42cf-a552-ba43ed4b640c', // get id manually from supabase
    {
      user_metadata: {
        user_role: 'admin', // edit role here
      },
    }
  );

  if (error) {
    console.error('Error creating user:', error);
  } else {
    console.log('User created successfully:', data);
  }
}

main();
