CREATE TABLE "form_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_type" "form_type" NOT NULL,
	"reference_id" uuid NOT NULL,
	"status" "status" DEFAULT 'pending' NOT NULL,
	"submitted_by" uuid,
	"reviewed_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "form_submissions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "hospital_trip_tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
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
	"sig_nurse" varchar(10000),
	"sig_billing" varchar(10000),
	"sig_ambulance" varchar(10000),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hospital_trip_tickets" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_submitted_by_users_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;