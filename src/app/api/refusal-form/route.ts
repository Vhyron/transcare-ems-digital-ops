// app/api/refusal-form/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper function to truncate text fields if they exceed database limits
function truncateText(
  text: string | null | undefined,
  maxLength: number
): string | null {
  if (!text) return null;
  return text.length > maxLength ? text.substring(0, maxLength) : text;
}
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { formData } = body;

    if (!formData) {
      return NextResponse.json(
        { error: 'Form data is required' },
        { status: 400 }
      );
    }

    // Fixed mapping - use consistent property names
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
      guardian: formData.guardian === 'yes',
      guardian_landline: truncateText(formData.guardianLandline, 50),
      guardian_cell: truncateText(formData.guardianCell, 50),
      guardian_name: truncateText(formData.guardianName, 255),
      guardian_age: formData.guardianAge
        ? parseInt(formData.guardianAge)
        : null,
      relationship: truncateText(formData.relationship, 255),
      situation: formData.situation,
      treatment_refused: formData.treatmentRefused,
      treatment_not_necessary:
        formData.refusalReasons?.treatmentNotNecessary || false,
      refuses_transport_against_advice:
        formData.refusalReasons?.refusesTransportAgainstAdvice || false,
      treatment_received_no_transport:
        formData.refusalReasons?.treatmentReceivedNoTransport || false,
      alternative_transportation:
        formData.refusalReasons?.alternativeTransportation || false,
      accepts_transport_refuses_treatment:
        formData.refusalReasons?.acceptsTransportRefusesTreatment || false,
      company: truncateText(formData.company, 255),
      pcr: truncateText(formData.pcr, 255),
      form_date: formData.date,
      form_time: formData.time,

      // FIXED: Use consistent property names for signatures
      patient_guardian_signature_image:
        formData.patientGuardian?.patient_guardian_signature_image || null,
      patient_guardian_signature_name: truncateText(
        formData.patientGuardian?.patient_guardian_signature_name,
        255
      ),
      events_organizer_signature_image:
        formData.eventsOrganizer?.events_organizer_signature_image || null,
      events_organizer_signature_name: truncateText(
        formData.eventsOrganizer?.events_organizer_signature_name,
        255
      ),
      witness_signature_image:
        formData.witness?.witness_signature_image || null,
      witness_signature_name: truncateText(
        formData.witness?.witness_signature_name,
        255
      ),
      medic_personnel_signature_image:
        formData.medicPersonnel?.medic_personnel_signature_image || null,
      medic_personnel_signature_name: truncateText(
        formData.medicPersonnel?.medic_personnel_signature_name,
        255
      ),
      status: 'submitted',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('refusal_forms')
      .insert([mappedData])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Rest of your POST logic...
    return NextResponse.json({
      success: true,
      data: data[0],
      id: data[0].id,
      message: 'Refusal form saved successfully',
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = supabase.from('refusal_forms').select('*');

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      total: data?.length || 0,
    });
  } catch (error) {
    console.error('Error fetching forms:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch forms' },
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
        { error: 'ID and form data are required' },
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
      guardian: formData.guardian === 'yes',
      guardian_landline: truncateText(formData.guardianLandline, 50),
      guardian_cell: truncateText(formData.guardianCell, 50),
      guardian_name: truncateText(formData.guardianName, 255),
      guardian_age: formData.guardianAge
        ? parseInt(formData.guardianAge)
        : null,
      relationship: truncateText(formData.relationship, 255),
      situation: formData.situation,
      treatment_refused: formData.treatmentRefused,
      treatment_not_necessary:
        formData.refusalReasons?.treatmentNotNecessary || false,
      refuses_transport_against_advice:
        formData.refusalReasons?.refusesTransportAgainstAdvice || false,
      treatment_received_no_transport:
        formData.refusalReasons?.treatmentReceivedNoTransport || false,
      alternative_transportation:
        formData.refusalReasons?.alternativeTransportation || false,
      accepts_transport_refuses_treatment:
        formData.refusalReasons?.acceptsTransportRefusesTreatment || false,
      company: truncateText(formData.company, 255),
      pcr: truncateText(formData.pcr, 255),
      form_date: formData.date,
      form_time: formData.time,
      patient_guardian_signature_image:
        formData.patientGuardian?.patient_guardian_signature_image || null,
      patient_guardian_signature_name: truncateText(
        formData.patientGuardian?.patient_guardian_signature_name,
        255
      ),
      events_organizer_signature_image:
        formData.eventsOrganizer?.events_organizer_signature_image || null,
      events_organizer_signature_name: truncateText(
        formData.eventsOrganizer?.events_organizer_signature_name,
        255
      ),
      witness_signature_image:
        formData.witness?.witness_signature_image || null,
      witness_signature_name: truncateText(
        formData.witness?.witness_signature_name,
        255
      ),
      medic_personnel_signature_image:
        formData.medicPersonnel?.medic_personnel_signature_image || null,
      medic_personnel_signature_name: truncateText(
        formData.medicPersonnel?.medic_personnel_signature_name,
        255
      ),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('refusal_forms')
      .update(mappedData)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Form not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data[0],
      message: 'Form updated successfully',
    });
  } catch (error) {
    console.error('Error updating form:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update form' },
      { status: 500 }
    );
  }
}
