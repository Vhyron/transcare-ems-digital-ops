import { pgEnum, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { usersTable } from "./users.schema";

const formTypeEnum = pgEnum("form_type", [
  "dispatch_form", 
  "trip_tickets", 
  "census_record", 
  "advance_directives", 
  "refusal_form",          
  "conduction_refusal_form" 
]);

const formStatusEnum = pgEnum("status", ["pending", "approved", "rejected"]);

export const formSubmissions = pgTable("form_submissions", {
  id: uuid().primaryKey().defaultRandom(),

  form_type: formTypeEnum().notNull(), 
  reference_id: uuid().notNull(), 
  status: formStatusEnum().notNull().default('pending'), 

  submitted_by: uuid().references(() => usersTable.id, { onDelete: 'set null' }),
  reviewed_by: uuid().references(() => usersTable.id, { onDelete: 'set null' }), 

  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
}).enableRLS();

export type FormSubmission = typeof formSubmissions.$inferSelect;
export type NewFormSubmission = typeof formSubmissions.$inferInsert;

export const NewFormSubmissionSchema = createInsertSchema(formSubmissions);
export const UpdateFormSubmissionSchema = createUpdateSchema(formSubmissions);