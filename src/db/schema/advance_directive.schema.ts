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

export const ADVANCE_DIRECTIVES_TABLE = 'advance_directives';
export const advanceDirectives = pgTable(ADVANCE_DIRECTIVES_TABLE, {
  id: uuid().primaryKey().defaultRandom(),

  // Patient information
  patient_first_name: varchar({ length: 100 }).notNull(),
  patient_middle_name: varchar({ length: 100 }),
  patient_last_name: varchar({ length: 100 }).notNull(),
  patient_age: varchar({ length: 10 }),
  patient_sex: varchar({ length: 10 }),
  patient_birthdate: date(),
  patient_citizenship: varchar({ length: 100 }),
  patient_address: varchar({ length: 200 }),
  patient_contact_no: varchar({ length: 20 }),

  // Next of kin information
  next_of_kin_name: varchar({ length: 100 }),
  next_of_kin_relation: varchar({ length: 50 }),
  next_of_kin_contact_no: varchar({ length: 20 }),
  next_of_kin_address: varchar({ length: 200 }),

  // Medical record
  medical_record_number: varchar({ length: 50 }),
  medical_record_date_accomplished: date(),

  // Care preferences
  attempt_cpr: boolean().default(false),
  comfort_only: boolean().default(false),
  limited_intervention: boolean().default(false),
  iv_fluid: boolean().default(false),
  ng_tube: boolean().default(false),
  gt_tube: boolean().default(false),
  cpap_bipap: boolean().default(false),
  antibiotics: boolean().default(false),
  laboratory: boolean().default(false),
  diagnostics: boolean().default(false),
  full_treatment: boolean().default(false),

  // Additional orders
  additional_orders: text(),

  // Discussed with
  discussed_with_patient: boolean().default(false),
  discussed_with_kin: boolean().default(false),

  // Decision maker
  decision_maker_name: varchar({ length: 100 }),
  decision_maker_relation: varchar({ length: 50 }),
  decision_maker_date_signed: date(),
  decision_maker_signature: text(), // base64 encoded

  // Physician
  physician_name: varchar({ length: 100 }),
  physician_prc_license_number: varchar({ length: 50 }),
  physician_date_signed: date(),
  physician_signature: text(), // base64 encoded

  // Metadata
  created_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
}).enableRLS();

export type AdvanceDirectiveForm = typeof advanceDirectives.$inferSelect;
export type NewAdvanceDirectiveForm = typeof advanceDirectives.$inferInsert;

export const NewAdvanceDirectiveFormSchema =
  createInsertSchema(advanceDirectives);
export const UpdateAdvanceDirectiveFormSchema =
  createUpdateSchema(advanceDirectives);
