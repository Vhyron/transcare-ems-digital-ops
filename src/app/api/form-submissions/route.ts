// app/api/form-submissions/route.ts
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.form_type || !body.reference_id) {
      return NextResponse.json(
        { error: "Form type and reference ID are required" }, 
        { status: 400 }
      );
    }

    // Get the current user from the request headers (JWT token)
    const authHeader = request.headers.get('authorization');
    let currentUserId = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      
      try {
        // Create a client with the user's token to get their info
        const userSupabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        
        const { data: { user }, error: userError } = await userSupabase.auth.getUser(token);
        
        if (userError) {
          console.error("Error getting user:", userError);
        } else if (user) {
          currentUserId = user.id;
          console.log("Current user ID:", currentUserId);
        }
      } catch (tokenError) {
        console.error("Error validating token:", tokenError);
      }
    }
    
    // Debug: Print the user ID
    console.log("Attempting to insert form submission with user ID:", currentUserId);
    console.log("Form type:", body.form_type);
    console.log("Reference ID:", body.reference_id);

    const insertData = {
      form_type: body.form_type,
      reference_id: body.reference_id,
      status: body.status || 'pending',
      submitted_by: currentUserId || body.submitted_by || null,
      reviewed_by: body.reviewed_by || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log("Insert data:", insertData);

    const { data, error } = await supabase
      .from("form_submissions")
      .insert([insertData])
      .select();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("Successfully inserted form submission:", data[0]);

    return NextResponse.json({ 
      success: true, 
      data: data[0],
      message: "Form submission tracking created successfully" 
    });

  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const formType = searchParams.get('form_type');
    const status = searchParams.get('status');
    
    let query = supabase.from('form_submissions').select('*');
    
    if (formType) {
      query = query.eq('form_type', formType);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      console.error('Supabase GET error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error('API GET error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}