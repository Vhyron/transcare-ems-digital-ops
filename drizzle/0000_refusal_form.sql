
CREATE TABLE refusal_forms (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'completed')),
    
    "league_event" VARCHAR(255),
    "type" VARCHAR(100),
    "location" VARCHAR(255),
    "incident" VARCHAR(255),
    
    "patient_name" VARCHAR(255),
    "dob" DATE,
    "age" INTEGER,
    "landline" VARCHAR(20),
    "cell" VARCHAR(20),
    
    "guardian" BOOLEAN DEFAULT true,
    "guardian_landline" VARCHAR(20),
    "guardian_cell" VARCHAR(20),
    "guardian_name" VARCHAR(255),
    "guardian_age" INTEGER,
    "relationship" VARCHAR(100),
    
    "situation" TEXT,
    "treatment_refused" TEXT,
    
    "treatment_not_necessary" BOOLEAN DEFAULT false,
    "refuses_transport_against_advice" BOOLEAN DEFAULT false,
    "treatment_received_no_transport" BOOLEAN DEFAULT false,
    "alternative_transportation" BOOLEAN DEFAULT false,
    "accepts_transport_refuses_treatment" BOOLEAN DEFAULT false,
    
    "company" VARCHAR(255),
    "pcr" VARCHAR(100),
    "form_date" DATE,
    "form_time" TIME,
    
    "patient_guardian_signature_image" TEXT,
    "patient_guardian_signature_name" VARCHAR(255),
    
    "events_organizer_signature_image" TEXT,
    "events_organizer_signature_name" VARCHAR(255),
    
    "witness_signature_image" TEXT,
    "witness_signature_name" VARCHAR(255),
    
    "medic_personnel_signature_image" TEXT,
    "medic_personnel_signature_name "VARCHAR(255),
    
    "created_by" UUID, 
    "updated_by" UUID 
);

CREATE INDEX idx_refusal_forms_status ON refusal_forms(status);
CREATE INDEX idx_refusal_forms_created_at ON refusal_forms(created_at);
CREATE INDEX idx_refusal_forms_patient_name ON refusal_forms(patient_name);
CREATE INDEX idx_refusal_forms_form_date ON refusal_forms(form_date);
CREATE INDEX idx_refusal_forms_league_event ON refusal_forms(league_event);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_refusal_forms_updated_at
    BEFORE UPDATE ON refusal_forms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
