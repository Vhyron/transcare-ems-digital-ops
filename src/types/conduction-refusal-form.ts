// types/conduction-refusal-form.ts
export interface ConductionRefusalFormData {
  id?: string;
  created_at?: string;
  updated_at?: string;

  // Patient General Information
  patient_first_name?: string;
  patient_middle_name?: string;
  patient_last_name?: string;
  patient_age?: number;
  patient_sex?: string;
  patient_birthdate?: string;
  patient_citizenship?: string;
  patient_address?: string;
  patient_contact_no?: string;

  // Next of Kin/Legal Guardian Information
  kin_name?: string;
  kin_relation?: string;
  kin_contact_no?: string;
  kin_address?: string;
  medical_record?: string;
  date_accomplished?: string;

  // Vital Signs
  vital_bp?: string;
  vital_pulse?: string;
  vital_resp?: string;
  vital_skin?: string;
  vital_pupils?: string;
  vital_loc?: string;

  // Mental Status Assessment
  oriented_person_place_time?: boolean;
  coherent_speech?: boolean;
  hallucinations?: boolean;
  suicidal_homicidal_ideation?: boolean;
  understands_refusal_consequences?: boolean;

  // Narrative
  narrative_description?: string;

  // Refusal Options
  refused_treatment_and_transport?: boolean;
  refused_treatment_willing_transport?: boolean;
  wants_treatment_refused_transport?: boolean;

  // Witness Information
  witness_name?: string;
  witness_date?: string;
  witness_signature_image?: string;

  // Metadata
  form_status?: "draft" | "completed" | "archived";
  completed_by?: string;
}

export interface ConductionRefusalFormInsert
  extends Omit<ConductionRefusalFormData, "id" | "created_at" | "updated_at"> {
  completed_by: string;
}

export interface ConductionRefusalFormUpdate
  extends Partial<ConductionRefusalFormInsert> {
  id: string;
}

export interface ConductionRefusalFormResponse {
  success: boolean;
  data?: ConductionRefusalFormData;
  message?: string;
  error?: string;
}

export interface ConductionRefusalFormListResponse {
  success: boolean;
  data?: ConductionRefusalFormData[];
  total?: number;
  page?: number;
  limit?: number;
  message?: string;
  error?: string;
}
export interface ConductionRefusalFormRequest {
  id: string;
  formData: Partial<ConductionRefusalFormData>;
}
