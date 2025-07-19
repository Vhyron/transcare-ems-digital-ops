// app/api/conduction-refusal-form/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {

  try {
    const { formData } = await request.json();

    // Log the incoming data for debugging
    console.log('Received form data:', JSON.stringify(formData, null, 2));

    // Validate required fields
    if (!formData.patient_first_name || !formData.patient_last_name) {
      return NextResponse.json(
        { message: 'Patient name is required' },
        { status: 400 }
      );
    }

    // FIXED: Better signature path extraction logic with comprehensive debugging
    console.log('=== SIGNATURE DEBUGGING ===');
    console.log('formData.witnessSignature:', formData.witnessSignature);
    console.log('formData.witness_signature_image:', formData.witness_signature_image);
    
    // Prepare the data for insertion
    const insertData = {
      // Patient General Information
      patient_first_name: formData.patient_first_name || null,
      patient_middle_name: formData.patient_middle_name || null,
      patient_last_name: formData.patient_last_name || null,
      patient_age: formData.patient_age ? parseInt(formData.patient_age) : null,
      patient_sex: formData.patient_sex || null,
      patient_birthdate: formData.patient_birthdate || null,
      patient_citizenship: formData.patient_citizenship || null,
      patient_address: formData.patient_address || null,
      patient_contact_no: formData.patient_contact_no || null,

      // Next of Kin/Legal Guardian Information
      kin_name: formData.kin_name || null,
      kin_relation: formData.kin_relation || null,
      kin_contact_no: formData.kin_contact_no || null,
      kin_address: formData.kin_address || null,
      medical_record: formData.medical_record || null,
      date_accomplished: formData.date_accomplished || null,

      // Vital Signs
      vital_bp: formData.vital_bp || null,
      vital_pulse: formData.vital_pulse || null,
      vital_resp: formData.vital_resp || null,
      vital_skin: formData.vital_skin || null,
      vital_pupils: formData.vital_pupils || null,
      vital_loc: formData.vital_loc || null,

      // Mental Status Assessment
      oriented_person_place_time:
        formData.oriented_person_place_time === true ||
        formData.oriented_person_place_time === 'yes',
      coherent_speech:
        formData.coherent_speech === true || formData.coherent_speech === 'yes',
      hallucinations:
        formData.hallucinations === true || formData.hallucinations === 'yes',
      suicidal_homicidal_ideation:
        formData.suicidal_homicidal_ideation === true ||
        formData.suicidal_homicidal_ideation === 'yes',
      understands_refusal_consequences:
        formData.understands_refusal_consequences === true ||
        formData.understands_refusal_consequences === 'yes',

      // Narrative
      narrative_description: formData.narrative_description || null,

      // Refusal Options
      refused_treatment_and_transport:
        formData.refused_treatment_and_transport === true,
      refused_treatment_willing_transport:
        formData.refused_treatment_willing_transport === true,
      wants_treatment_refused_transport:
        formData.wants_treatment_refused_transport === true,

      // Witness Information - FIXED: Use the extracted path
      witness_name: formData.witness_name || null,
      witness_date: formData.witness_date || null,
      witness_signature_image: formData.witness_signature_image, 

      // Metadata
      completed_by: formData.completed_by || null,
      form_status: formData.form_status || 'draft',
    };

    console.log('Prepared insert data:', JSON.stringify(insertData, null, 2));

    // Insert into database
    const { data, error } = await supabase
      .from('conduction_refusal_forms')
      .insert([insertData])
      .select();

    if (error) {
      console.error('Supabase error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });

      return NextResponse.json(
        {
          message: 'Failed to save conduction refusal form',
          error: error.message,
          details: error.details,
          hint: error.hint,
        },
        { status: 500 }
      );
    }

    console.log('Successfully inserted data:', data);

    return NextResponse.json({
      success: true,
      message: 'Form submitted successfully',
      data: data[0],
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      {
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const { data, error } = await supabase
        .from('conduction_refusal_forms')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Supabase GET error:', error);
        return NextResponse.json(
          {
            message: 'Failed to fetch conduction refusal form',
            error: error.message,
          },
          { status: 500 }
        );
      }

      return NextResponse.json({ data });
    } else {
      const { data, error } = await supabase
        .from('conduction_refusal_forms')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase GET error:', error);
        return NextResponse.json(
          {
            message: 'Failed to fetch conduction refusal forms',
            error: error.message,
          },
          { status: 500 }
        );
      }

      return NextResponse.json({ data });
    }
  } catch (error) {
    console.error('API GET error:', error);
    return NextResponse.json(
      {
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}