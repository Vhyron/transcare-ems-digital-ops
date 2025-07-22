// app/api/advance-directives/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();
    
    // Log the incoming data for debugging
    console.log('Received form data:', JSON.stringify(formData, null, 2));
    
    // Validate required fields
    if (!formData.patient?.firstName || !formData.patient?.lastName) {
      return NextResponse.json(
        { message: 'Patient name is required' },
        { status: 400 }
      );
    }
    
    // Prepare the data for insertion
    const insertData = {
      // Patient information
      patient_first_name: formData.patient.firstName || '',
      patient_middle_name: formData.patient.middleName || '',
      patient_last_name: formData.patient.lastName || '',
      patient_age: formData.patient.age || '',
      patient_sex: formData.patient.sex || '',
      patient_birthdate: formData.patient.birthdate || null,
      patient_citizenship: formData.patient.citizenship || '',
      patient_address: formData.patient.address || '',
      patient_contact_no: formData.patient.contactNo || '',
      
      // Next of kin information
      next_of_kin_name: formData.nextOfKin?.name || '',
      next_of_kin_relation: formData.nextOfKin?.relation || '',
      next_of_kin_contact_no: formData.nextOfKin?.contactNo || '',
      next_of_kin_address: formData.nextOfKin?.address || '',
      
      // Medical record
      medical_record_number: formData.medicalRecord?.recordNumber || '',
      medical_record_date_accomplished: formData.medicalRecord?.dateAccomplished || null,
      
      // Care preferences
      attempt_cpr: formData.carePreferences?.attemptCPR || false,
      comfort_only: formData.carePreferences?.comfortOnly || false,
      limited_intervention: formData.carePreferences?.limitedIntervention || false,
      iv_fluid: formData.carePreferences?.limitedInterventionOptions?.ivFluid || false,
      ng_tube: formData.carePreferences?.limitedInterventionOptions?.ngTube || false,
      gt_tube: formData.carePreferences?.limitedInterventionOptions?.gtTube || false,
      // o2_therapy: formData.carePreferences?.limitedInterventionOptions?.o2Therapy || false,
      cpap_bipap: formData.carePreferences?.limitedInterventionOptions?.cpapBipap || false,
      antibiotics: formData.carePreferences?.limitedInterventionOptions?.antibiotics || false,
      laboratory: formData.carePreferences?.limitedInterventionOptions?.laboratory || false,
      diagnostics: formData.carePreferences?.limitedInterventionOptions?.diagnostics || false,
      full_treatment: formData.carePreferences?.fullTreatment || false,
      
      // Additional orders
      additional_orders: formData.additionalOrders || '',
      
      // Discussed with
      discussed_with_patient: formData.discussedWith?.withPatient || false,
      discussed_with_kin: formData.discussedWith?.withKin || false,
      
      // Decision maker
      decision_maker_name: formData.decisionMaker?.name || '',
      decision_maker_relation: formData.decisionMaker?.relation || '',
      decision_maker_date_signed: formData.decisionMaker?.dateSigned || null,
      decision_maker_signature: formData.decisionMaker?.signature || null,
      
      // Physician
      physician_name: formData.physician?.name || '',
      physician_prc_license_number: formData.physician?.prcLicenseNumber || '',
      physician_date_signed: formData.physician?.dateSigned || null,
      physician_signature: formData.physician?.signature || null,
      
      // Metadata
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    console.log('Prepared insert data:', JSON.stringify(insertData, null, 2));
    
    // Insert the main advance directive record
    const { data, error } = await supabase
      .from('advance_directives')
      .insert([insertData])
      .select();

    if (error) {
      console.error('Supabase error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      return NextResponse.json(
        { 
          message: 'Failed to save advance directive', 
          error: error.message,
          details: error.details,
          hint: error.hint 
        },
        { status: 500 }
      );
    }

    console.log('Successfully inserted data:', data);

    return NextResponse.json({
      message: 'Advance directive saved successfully',
      data: data[0],
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { 
        message: 'Internal server error', 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
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
        .from('advance_directives')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) {
        console.error('Supabase GET error:', error);
        return NextResponse.json(
          { message: 'Failed to fetch advance directive', error: error.message },
          { status: 500 }
        );
      }
      
      return NextResponse.json({ data });
    } else {
      const { data, error } = await supabase
        .from('advance_directives')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Supabase GET error:', error);
        return NextResponse.json(
          { message: 'Failed to fetch advance directives', error: error.message },
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
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}