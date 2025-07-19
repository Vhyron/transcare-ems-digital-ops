// app/api/operation-census/route.ts
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { formData } = body;

    if (!formData) {
      return NextResponse.json({ error: "Form data is required" }, { status: 400 });
    }

    // Validate required fields
    if (!formData.date || !formData.event_owner) {
      return NextResponse.json({ 
        error: "Date and Event Owner are required fields" 
      }, { status: 400 });
    }

    // Validate form_data structure
    if (!Array.isArray(formData.form_data)) {
      return NextResponse.json({ 
        error: "form_data must be an array of patient records" 
      }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("operation_census_records")
      .insert([{
        date: formData.date,
        event_owner: formData.event_owner,
        time_in: formData.time_in,
        time_out: formData.time_out,
        activity: formData.activity,
        location: formData.location,
        form_data: formData.form_data, // JSONB array of patient records
        prepared_by_signature: formData.prepared_by_signature,
        conformed_by_signature: formData.conformed_by_signature,
        created_by: formData.created_by,
      }])
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data: data[0],
      message: "Operation census record saved successfully" 
    });

  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      // Get specific record
      const { data, error } = await supabase
        .from("operation_census_records")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Supabase error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ data });
    } else {
      // Get all records
      const { data, error } = await supabase
        .from("operation_census_records")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ data });
    }
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}