import {
  pgTable,
  uuid,
  varchar,
  boolean,
  text,
  date,
  timestamp,
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createUpdateSchema } from 'drizzle-zod';

export const CONDUCTION_REFUSAL_FORMS_TABLE = 'conduction_refusal_forms';
export const conductionRefusalForms = pgTable(CONDUCTION_REFUSAL_FORMS_TABLE, {
  id: uuid().primaryKey().defaultRandom(),

  // Timestamps
  created_at: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp({ withTimezone: true }).defaultNow().notNull(),

  // Patient General Information
  patient_first_name: varchar({ length: 100 }),
  patient_middle_name: varchar({ length: 100 }),
  patient_last_name: varchar({ length: 100 }),
  patient_age: varchar({ length: 3 }), // can be varchar or integer if preferred
  patient_sex: varchar({ length: 20 }),
  patient_birthdate: date(),
  patient_citizenship: varchar({ length: 100 }),
  patient_address: text(),
  patient_contact_no: varchar({ length: 50 }),

  // Next of Kin / Legal Guardian Information
  kin_name: varchar({ length: 200 }),
  kin_relation: varchar({ length: 100 }),
  kin_contact_no: varchar({ length: 50 }),
  kin_address: text(),
  medical_record: varchar({ length: 100 }),
  date_accomplished: date(),

  // Vital Signs
  vital_bp: varchar({ length: 20 }),
  vital_pulse: varchar({ length: 20 }),
  vital_resp: varchar({ length: 20 }),
  vital_skin: varchar({ length: 50 }),
  vital_pupils: varchar({ length: 50 }),
  vital_loc: varchar({ length: 50 }),

  // Mental Status Assessment
  oriented_person_place_time: boolean().default(false),
  coherent_speech: boolean().default(false),
  hallucinations: boolean().default(false),
  suicidal_homicidal_ideation: boolean().default(false),
  understands_refusal_consequences: boolean().default(false),

  // Narrative
  narrative_description: text(),

  // Refusal Options
  refused_treatment_and_transport: boolean().default(false),
  refused_treatment_willing_transport: boolean().default(false),
  wants_treatment_refused_transport: boolean().default(false),

  // Witness Information
  witness_name: varchar({ length: 200 }),
  witness_date: date(),
  witness_signature_image: text(), // base64-encoded image

  // Metadata
  form_status: varchar({ length: 20 }).default('draft'),
  completed_by: uuid(),
}).enableRLS();

// Inferred types
export type ConductionRefusalForm = typeof conductionRefusalForms.$inferSelect;
export type NewConductionRefusalForm =
  typeof conductionRefusalForms.$inferInsert;

// Zod schemas
export const NewConductionRefusalFormSchema = createInsertSchema(
  conductionRefusalForms
);
export const UpdateConductionRefusalFormSchema = createUpdateSchema(
  conductionRefusalForms
);
