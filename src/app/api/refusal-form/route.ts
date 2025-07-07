// app/api/refusal-form/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);


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

    // Map frontend field names to database column names
    const mappedData = {
      league_event: formData.leagueEvent,
      type: formData.type,
      location: formData.location,
      incident: formData.incident,
      patient_name: formData.patientName,
      dob: formData.dob,
      age: formData.age ? parseInt(formData.age) : null,
      landline: formData.landline,
      cell: formData.cell,
      guardian: formData.guardian === "yes",
      guardian_landline: formData.guardianLandline,
      guardian_cell: formData.guardianCell,
      guardian_name: formData.guardianName,
      guardian_age: formData.guardianAge ? parseInt(formData.guardianAge) : null,
      relationship: formData.relationship,
      situation: formData.situation,
      treatment_refused: formData.treatmentRefused,
      treatment_not_necessary: formData.refusalReasons?.treatmentNotNecessary || false,
      refuses_transport_against_advice: formData.refusalReasons?.refusesTransportAgainstAdvice || false,
      treatment_received_no_transport: formData.refusalReasons?.treatmentReceivedNoTransport || false,
      alternative_transportation: formData.refusalReasons?.alternativeTransportation || false,
      accepts_transport_refuses_treatment: formData.refusalReasons?.acceptsTransportRefusesTreatment || false,
      company: formData.company,
      pcr: formData.pcr,
      form_date: formData.date,
      form_time: formData.time,
      patient_guardian_signature_image: formData.patientGuardian?.image || null,
      patient_guardian_signature_name: formData.patientGuardian?.name || null,
      events_organizer_signature_image: formData.eventsOrganizer?.image || null,
      events_organizer_signature_name: formData.eventsOrganizer?.name || null,
      witness_signature_image: formData.witness?.image || null,
      witness_signature_name: formData.witness?.name || null,
      medic_personnel_signature_image: formData.medicPersonnel?.image || null,
      medic_personnel_signature_name: formData.medicPersonnel?.name || null,
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

    return NextResponse.json({
      success: true,
      data: data[0],
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

    // Map frontend field names to database column names
    const mappedData = {
      league_event: formData.leagueEvent,
      type: formData.type,
      location: formData.location,
      incident: formData.incident,
      patient_name: formData.patientName,
      dob: formData.dob,
      age: formData.age ? parseInt(formData.age) : null,
      landline: formData.landline,
      cell: formData.cell,
      guardian: formData.guardian === "yes",
      guardian_landline: formData.guardianLandline,
      guardian_cell: formData.guardianCell,
      guardian_name: formData.guardianName,
      guardian_age: formData.guardianAge ? parseInt(formData.guardianAge) : null,
      relationship: formData.relationship,
      situation: formData.situation,
      treatment_refused: formData.treatmentRefused,
      treatment_not_necessary: formData.refusalReasons?.treatmentNotNecessary || false,
      refuses_transport_against_advice: formData.refusalReasons?.refusesTransportAgainstAdvice || false,
      treatment_received_no_transport: formData.refusalReasons?.treatmentReceivedNoTransport || false,
      alternative_transportation: formData.refusalReasons?.alternativeTransportation || false,
      accepts_transport_refuses_treatment: formData.refusalReasons?.acceptsTransportRefusesTreatment || false,
      company: formData.company,
      pcr: formData.pcr,
      form_date: formData.date,
      form_time: formData.time,
      patient_guardian_signature_image: formData.patientGuardian?.image || null,
      patient_guardian_signature_name: formData.patientGuardian?.name || null,
      events_organizer_signature_image: formData.eventsOrganizer?.image || null,
      events_organizer_signature_name: formData.eventsOrganizer?.name || null,
      witness_signature_image: formData.witness?.image || null,
      witness_signature_name: formData.witness?.name || null,
      medic_personnel_signature_image: formData.medicPersonnel?.image || null,
      medic_personnel_signature_name: formData.medicPersonnel?.name || null,
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