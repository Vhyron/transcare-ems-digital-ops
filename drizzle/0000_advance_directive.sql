CREATE TABLE "advance_directives" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Patient information
  "patient_first_name" varchar(100) NOT NULL,
  "patient_middle_name" varchar(100),
  "patient_last_name" varchar(100) NOT NULL,
  "patient_age" varchar(10),
  "patient_sex" varchar(10),
  "patient_birthdate" date,
  "patient_citizenship" varchar(100),
  "patient_address" varchar(200),
  "patient_contact_no" varchar(20),

  -- Next of kin information
  "next_of_kin_name" varchar(100),
  "next_of_kin_relation" varchar(50),
  "next_of_kin_contact_no" varchar(20),
  "next_of_kin_address" varchar(200),

  -- Medical record
  "medical_record_number" varchar(50),
  "medical_record_date_accomplished" date,

  -- Care preferences
  "attempt_cpr" boolean DEFAULT false,
  "comfort_only" boolean DEFAULT false,
  "limited_intervention" boolean DEFAULT false,
  "iv_fluid" boolean DEFAULT false,
  "ng_tube" boolean DEFAULT false,
  "o2_therapy" boolean DEFAULT false,
  "cpap_bipap" boolean DEFAULT false,
  "antibiotics" boolean DEFAULT false,
  "diagnostics" boolean DEFAULT false,
  "full_treatment" boolean DEFAULT false,

  -- Additional orders
  "additional_orders" varchar(1000),

  -- Discussed with
  "discussed_with_patient" boolean DEFAULT false,
  "discussed_with_kin" boolean DEFAULT false,

  -- Decision maker
  "decision_maker_name" varchar(100),
  "decision_maker_relation" varchar(50),
  "decision_maker_date_signed" date,
  "decision_maker_signature" varchar(10000),

  -- Physician
  "physician_name" varchar(100),
  "physician_prc_license_number" varchar(50),
  "physician_date_signed" date,
  "physician_signature" varchar(10000),

  -- Metadata
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "advance_directives" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "advance_directives "
ALTER COLUMN "decision_maker_signature" TYPE TEXT,
ALTER COLUMN "physician_signature" TYPE TEXT;

-- Also update other potentially long fields
ALTER TABLE "advance_directives "
ALTER COLUMN "additional_orders" TYPE TEXT,
ALTER COLUMN "patient_address" TYPE TEXT,
ALTER COLUMN "next_of_kin_address" TYPE TEXT;