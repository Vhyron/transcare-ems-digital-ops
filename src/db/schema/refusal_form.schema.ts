import {
  pgTable,
  uuid,
  varchar,
  date,
  time,
  boolean,
  text,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";

export const refusalForms = pgTable("refusal_forms", {
  id: uuid().primaryKey().defaultRandom(),
  created_at: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp({ withTimezone: true }).defaultNow().notNull(),

  status: varchar({ length: 20 }).notNull().default("draft"),

  league_event: varchar({ length: 255 }),
  type: varchar({ length: 100 }),
  location: varchar({ length: 255 }),
  incident: varchar({ length: 255 }),

  patient_name: varchar({ length: 255 }),
  dob: date(),
  age: integer(), // Changed from uuid() to integer()
  landline: varchar({ length: 20 }),
  cell: varchar({ length: 20 }),

  guardian: boolean().default(true),
  guardian_landline: varchar({ length: 20 }),
  guardian_cell: varchar({ length: 20 }),
  guardian_name: varchar({ length: 255 }),
  guardian_age: integer(), // Changed from uuid() to integer()
  relationship: varchar({ length: 100 }),

  situation: text(),
  treatment_refused: text(),

  treatment_not_necessary: boolean().default(false),
  refuses_transport_against_advice: boolean().default(false),
  treatment_received_no_transport: boolean().default(false),
  alternative_transportation: boolean().default(false),
  accepts_transport_refuses_treatment: boolean().default(false),

  company: varchar({ length: 255 }),
  pcr: varchar({ length: 100 }),
  form_date: date(),
  form_time: time(),

  patient_guardian_signature_image: text(),
  patient_guardian_signature_name: varchar({ length: 255 }),

  events_organizer_signature_image: text(),
  events_organizer_signature_name: varchar({ length: 255 }),

  witness_signature_image: text(),
  witness_signature_name: varchar({ length: 255 }),

  medic_personnel_signature_image: text(),
  medic_personnel_signature_name: varchar({ length: 255 }),

  created_by: uuid(),
  updated_by: uuid(),
}).enableRLS();

export type RefusalForm = typeof refusalForms.$inferSelect;
export type NewRefusalForm = typeof refusalForms.$inferInsert;

export const NewRefusalFormSchema = createInsertSchema(refusalForms);
export const UpdateRefusalFormSchema = createUpdateSchema(refusalForms);