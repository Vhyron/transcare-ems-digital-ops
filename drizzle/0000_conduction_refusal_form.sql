-- Migration for Conduction Refusal Form
-- Create the conduction_refusal_forms table

CREATE TABLE conduction_refusal_forms (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Patient General Information
  "patient_first_name" VARCHAR(100),
  "patient_middle_name" VARCHAR(100),
  "patient_last_name" VARCHAR(100),
  "patient_age" INTEGER,
  "patient_sex" VARCHAR(20),
  "patient_birthdate" DATE,
  "patient_citizenship" VARCHAR(100),
  "patient_address" TEXT,
  "patient_contact_no" VARCHAR(50),
  
  -- Next of Kin/Legal Guardian Information
  "kin_name" VARCHAR(200),
  "kin_relation" VARCHAR(100),
  "kin_contact_no" VARCHAR(50),
  "kin_address" TEXT,
  "medical_record" VARCHAR(100),
  "date_accomplished" DATE,
  
  -- Vital Signs
  "vital_bp" VARCHAR(20),
  "vital_pulse" VARCHAR(20),
  "vital_resp" VARCHAR(20),
  "vital_skin" VARCHAR(50),
  "vital_pupils" VARCHAR(50),
  "vital_loc" VARCHAR(50),
  
  -- Mental Status Assessment (Yes/No questions)
  "oriented_person_place_time" BOOLEAN,
  "coherent_speech" BOOLEAN,
  "hallucinations" BOOLEAN,
  "suicidal_homicidal_ideation" BOOLEAN,
  "understands_refusal_consequences" BOOLEAN,
  
  -- Narrative
  "narrative_description" TEXT,
  
  -- Refusal Options (checkboxes)
  "refused_treatment_and_transport" BOOLEAN DEFAULT FALSE,
  "refused_treatment_willing_transport" BOOLEAN DEFAULT FALSE,
  "wants_treatment_refused_transport" BOOLEAN DEFAULT FALSE,
  
  -- Witness Information
  "witness_name" VARCHAR(200),
  "witness_date" DATE,
  "witness_signature_image" TEXT(255), -- Base64 encoded image
  
  -- Metadata
  "form_status" VARCHAR(20) DEFAULT 'draft', -- draft, completed, archived
  "completed_by" UUID REFERENCES auth.users(id),
  
  -- Indexes for better performance
  CONSTRAINT "conduction_refusal_forms_pkey" PRIMARY KEY (id)
);

-- Create indexes for better query performance
CREATE INDEX idx_conduction_refusal_forms_created_at ON conduction_refusal_forms(created_at);
CREATE INDEX idx_conduction_refusal_forms_patient_name ON conduction_refusal_forms(patient_last_name, patient_first_name);
CREATE INDEX idx_conduction_refusal_forms_status ON conduction_refusal_forms(form_status);
CREATE INDEX idx_conduction_refusal_forms_completed_by ON conduction_refusal_forms(completed_by);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_conduction_refusal_forms_updated_at
  BEFORE UPDATE ON conduction_refusal_forms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (Row Level Security)
ALTER TABLE conduction_refusal_forms ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own forms" ON conduction_refusal_forms
  FOR SELECT USING (auth.uid() = completed_by);

CREATE POLICY "Users can insert their own forms" ON conduction_refusal_forms
  FOR INSERT WITH CHECK (auth.uid() = completed_by);

CREATE POLICY "Users can update their own forms" ON conduction_refusal_forms
  FOR UPDATE USING (auth.uid() = completed_by);

-- Optional: Allow authenticated users to view all forms (adjust based on your requirements)
-- CREATE POLICY "Authenticated users can view all forms" ON conduction_refusal_forms
--   FOR SELECT USING (auth.role() = 'authenticated');