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

export const formSubmissionsTable = pgTable("form_submissions", {
  id: uuid().primaryKey().defaultRandom(),

  form_type: formTypeEnum().notNull(), 
  reference_id: uuid().notNull(), 
  status: formStatusEnum().notNull().default('pending'), 

  submitted_by: uuid().references(() => usersTable.id, { onDelete: 'set null' }),
  reviewed_by: uuid().references(() => usersTable.id, { onDelete: 'set null' }), 

  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),

});

export type FormSubmission = typeof formSubmissionsTable.$inferSelect;
export type NewFormSubmission = typeof formSubmissionsTable.$inferInsert;

// use this for validating data in the server
export const NewFormSubmissionSchema = createInsertSchema(formSubmissionsTable);
export const UpdateFormSubmissionSchema =
  createUpdateSchema(formSubmissionsTable);
