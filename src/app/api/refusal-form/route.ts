// app/api/refusal-form/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper function to truncate text fields if they exceed database limits
function truncateText(text: string | null | undefined, maxLength: number): string | null {
  if (!text) return null;
  return text.length > maxLength ? text.substring(0, maxLength) : text;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { formData } = body;

    if (!formData) {
      return NextResponse.json(
        { error: "Form data is required" },
        { status: 400 }
      );
    }

    // Map frontend field names to database column names with proper truncation
    const mappedData = {
      league_event: truncateText(formData.leagueEvent, 255),
      type: truncateText(formData.type, 255),
      location: truncateText(formData.location, 255),
      incident: truncateText(formData.incident, 255),
      patient_name: truncateText(formData.patientName, 255),
      dob: formData.dob,
      age: formData.age ? parseInt(formData.age) : null,
      landline: truncateText(formData.landline, 50),
      cell: truncateText(formData.cell, 50),
      guardian: formData.guardian === "yes",
      guardian_landline: truncateText(formData.guardianLandline, 50),
      guardian_cell: truncateText(formData.guardianCell, 50),
      guardian_name: truncateText(formData.guardianName, 255),
      guardian_age: formData.guardianAge ? parseInt(formData.guardianAge) : null,
      relationship: truncateText(formData.relationship, 255),
      situation: formData.situation, // Assuming this is TEXT type in database
      treatment_refused: formData.treatmentRefused, // Assuming this is TEXT type in database
      treatment_not_necessary: formData.refusalReasons?.treatmentNotNecessary || false,
      refuses_transport_against_advice: formData.refusalReasons?.refusesTransportAgainstAdvice || false,
      treatment_received_no_transport: formData.refusalReasons?.treatmentReceivedNoTransport || false,
      alternative_transportation: formData.refusalReasons?.alternativeTransportation || false,
      accepts_transport_refuses_treatment: formData.refusalReasons?.acceptsTransportRefusesTreatment || false,
      company: truncateText(formData.company, 255),
      pcr: truncateText(formData.pcr, 255),
      form_date: formData.date,
      form_time: formData.time,
      patient_guardian_signature_image: formData.patientGuardian?.image || null,
      patient_guardian_signature_name: truncateText(formData.patientGuardian?.name, 255),
      events_organizer_signature_image: formData.eventsOrganizer?.image || null,
      events_organizer_signature_name: truncateText(formData.eventsOrganizer?.name, 255),
      witness_signature_image: formData.witness?.image || null,
      witness_signature_name: truncateText(formData.witness?.name, 255),
      medic_personnel_signature_image: formData.medicPersonnel?.image || null,
      medic_personnel_signature_name: truncateText(formData.medicPersonnel?.name, 255),
      status: "submitted",
    };

    const { data, error } = await supabase
      .from("refusal_forms")
      .insert([mappedData])
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Create form submission tracking record
    const formId = data[0].id;
    try {
      const { error: submissionError } = await supabase
        .from("form_submissions")
        .insert({
          form_type: "refusal_form",
          reference_id: formId,
          status: "pending",
          submitted_by: "current_user_id", // Replace with actual user ID when available
          reviewed_by: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (submissionError) {
        console.error("Form submission tracking error:", submissionError);
        // Don't fail the main request, just log the error
      }
    } catch (submissionTrackingError) {
      console.error("Failed to create submission tracking:", submissionTrackingError);
    }

    return NextResponse.json({
      success: true,
      data: data[0],
      id: formId,
      message: "Refusal form saved successfully",
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let query = supabase.from("refusal_forms").select("*");

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      total: data?.length || 0,
    });
  } catch (error) {
    console.error("Error fetching forms:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch forms" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, formData } = body;

    if (!id || !formData) {
      return NextResponse.json(
        { error: "ID and form data are required" },
        { status: 400 }
      );
    }

    // Map frontend field names to database column names with proper truncation
    const mappedData = {
      league_event: truncateText(formData.leagueEvent, 255),
      type: truncateText(formData.type, 255),
      location: truncateText(formData.location, 255),
      incident: truncateText(formData.incident, 255),
      patient_name: truncateText(formData.patientName, 255),
      dob: formData.dob,
      age: formData.age ? parseInt(formData.age) : null,
      landline: truncateText(formData.landline, 50),
      cell: truncateText(formData.cell, 50),
      guardian: formData.guardian === "yes",
      guardian_landline: truncateText(formData.guardianLandline, 50),
      guardian_cell: truncateText(formData.guardianCell, 50),
      guardian_name: truncateText(formData.guardianName, 255),
      guardian_age: formData.guardianAge ? parseInt(formData.guardianAge) : null,
      relationship: truncateText(formData.relationship, 255),
      situation: formData.situation,
      treatment_refused: formData.treatmentRefused,
      treatment_not_necessary: formData.refusalReasons?.treatmentNotNecessary || false,
      refuses_transport_against_advice: formData.refusalReasons?.refusesTransportAgainstAdvice || false,
      treatment_received_no_transport: formData.refusalReasons?.treatmentReceivedNoTransport || false,
      alternative_transportation: formData.refusalReasons?.alternativeTransportation || false,
      accepts_transport_refuses_treatment: formData.refusalReasons?.acceptsTransportRefusesTreatment || false,
      company: truncateText(formData.company, 255),
      pcr: truncateText(formData.pcr, 255),
      form_date: formData.date,
      form_time: formData.time,
      patient_guardian_signature_image: formData.patientGuardian?.image || null,
      patient_guardian_signature_name: truncateText(formData.patientGuardian?.name, 255),
      events_organizer_signature_image: formData.eventsOrganizer?.image || null,
      events_organizer_signature_name: truncateText(formData.eventsOrganizer?.name, 255),
      witness_signature_image: formData.witness?.image || null,
      witness_signature_name: truncateText(formData.witness?.name, 255),
      medic_personnel_signature_image: formData.medicPersonnel?.image || null,
      medic_personnel_signature_name: truncateText(formData.medicPersonnel?.name, 255),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("refusal_forms")
      .update(mappedData)
      .eq("id", id)
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { success: false, message: "Form not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data[0],
      message: "Form updated successfully",
    });
  } catch (error) {
    console.error("Error updating form:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update form" },
      { status: 500 }
    );
  }
}