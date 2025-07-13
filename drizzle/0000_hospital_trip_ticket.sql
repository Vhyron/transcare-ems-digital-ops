CREATE TABLE "hospital_trip_tickets" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Trip Info
  "date" varchar(20) NOT NULL,
  "time" varchar(20) NOT NULL,
  "room" varchar(50),
  "trip_type" varchar(20),

  "vehicle" varchar(50),
  "plate" varchar(20),
  "age_sex" varchar(20),

  "patient_name" varchar(100),
  "purpose" varchar(100),
  "pickup" varchar(100),
  "destination" varchar(100),

  -- Billing
  "billing_class" varchar(20),
  "tare" varchar(20),
  "billing_type" varchar(20),

  "gross" varchar(20),
  "discount" varchar(20),
  "payables" varchar(20),
  "vat" varchar(20),
  "vatables" varchar(20),
  "zero_vat" varchar(20),
  "withholding" varchar(20),

  "remarks" varchar(1000),

  -- Signatures
  "sig_nurse" varchar(255),
  "sig_billing" varchar(255),
  "sig_ambulance" varchar(255),

  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "hospital_trip_tickets" ENABLE ROW LEVEL SECURITY;
