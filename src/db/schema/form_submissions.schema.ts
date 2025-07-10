import { pgEnum, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { createInsertSchema, createUpdateSchema } from 'drizzle-zod';
import { usersTable } from './users.schema';
import { DISPATCH_FORM_TABLE } from './dispatch_form.schema';
import { HOSPITAL_TRIP_TICKETS_TABLE } from './hospital-trip-ticket.schema';
import { ADVANCE_DIRECTIVES_TABLE } from './advance_directive.schema';
import { REFUSAL_FORMS_TABLE } from './refusal_form.schema';
import { CONDUCTION_REFUSAL_FORMS_TABLE } from './conduction_refusal_form.schema';

// Add new table forms here
export const FORM_TYPE_TABLES = [
  DISPATCH_FORM_TABLE,
  HOSPITAL_TRIP_TICKETS_TABLE,
  ADVANCE_DIRECTIVES_TABLE,
  REFUSAL_FORMS_TABLE,
  CONDUCTION_REFUSAL_FORMS_TABLE,
] as const;

export const formTypeEnum = pgEnum('form_types', FORM_TYPE_TABLES);
export type FormType = (typeof FORM_TYPE_TABLES)[number];

export const formStatusEnum = pgEnum('form_status', [
  'pending',
  'approved',
  'rejected',
]);

export const formSubmissionsTable = pgTable('form_submissions', {
  id: uuid().primaryKey().defaultRandom(),

  form_type: formTypeEnum().notNull(),
  reference_id: uuid().notNull(),
  status: formStatusEnum().notNull().default('pending'),

  submitted_by: uuid().references(() => usersTable.id, {
    onDelete: 'set null',
  }),
  reviewed_by: uuid().references(() => usersTable.id, { onDelete: 'set null' }),

  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
}).enableRLS();

export type FormSubmission = typeof formSubmissionsTable.$inferSelect;
export type NewFormSubmission = typeof formSubmissionsTable.$inferInsert;

// use this for validating data in the server
export const NewFormSubmissionSchema = createInsertSchema(formSubmissionsTable);
export const UpdateFormSubmissionSchema =
  createUpdateSchema(formSubmissionsTable);
