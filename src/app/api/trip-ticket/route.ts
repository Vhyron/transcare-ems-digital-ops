// app/api/trip-ticket/route.ts
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Server-side validation function
function validateFormData(formData: any) {
  const requiredFields = [
    'date', 'time', 'room', 'trip_type', 'vehicle', 'plate', 
    'age_sex', 'patient_name', 'purpose', 'pickup', 'destination',
    'billing_class', 'tare', 'billing_type', 'gross', 'discount',
    'payables', 'vat', 'vatables', 'zero_vat', 'withholding', 'remarks'
  ];

  const missingFields = [];

  for (const field of requiredFields) {
    if (!formData[field] || (typeof formData[field] === 'string' && formData[field].trim() === '')) {
      missingFields.push(field);
    }
  }

  // Check for required signatures
  const requiredSignatures = ['sig_nurse', 'sig_billing', 'sig_ambulance'];
  for (const sig of requiredSignatures) {
    if (!formData[sig]) {
      missingFields.push(sig);
    }
  }

  return {
    isValid: missingFields.length === 0,
    missingFields
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { formData } = body;

    if (!formData) {
      return NextResponse.json({ error: "Form data is required" }, { status: 400 });
    }

    // Server-side validation
    const validation = validateFormData(formData);
    if (!validation.isValid) {
      return NextResponse.json({ 
        error: "Validation failed", 
        message: `Missing required fields: ${validation.missingFields.join(', ')}`,
        missingFields: validation.missingFields
      }, { status: 400 });
    }

    const numericFields = ['gross', 'discount', 'payables', 'vat', 'vatables', 'zero_vat', 'withholding'];
    for (const field of numericFields) {
      if (formData[field] !== '' && isNaN(parseFloat(formData[field]))) {
        return NextResponse.json({ 
          error: "Invalid data type", 
          message: `Field '${field}' must be a valid number`
        }, { status: 400 });
      }
    }

    // Date validation
    if (formData.date && !Date.parse(formData.date)) {
      return NextResponse.json({ 
        error: "Invalid date format", 
        message: "Date field must be a valid date"
      }, { status: 400 });
    }

    // Time validation (basic HH:MM format check)
    if (formData.time && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(formData.time)) {
      return NextResponse.json({ 
        error: "Invalid time format", 
        message: "Time field must be in HH:MM format"
      }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("hospital_trip_tickets")
      .insert([formData])
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data: data[0],
      id: data[0]?.id,
      message: "Trip ticket saved successfully" 
    });

  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}