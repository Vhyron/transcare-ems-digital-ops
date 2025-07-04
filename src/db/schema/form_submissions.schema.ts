// Guide to utilize this schema
// this schema is only but a reference to the real form data tables like dispatch_form, trip_tickets, etc.
// so we create a new table for each forms we have, and then add it to the formTypeEnum below,
// then we use the reference_id here to point to the id of the associated form type
// example use case would a submission for trip_tickets
// when we submit a form first we create an entry to the trip_tickets table
// then after the trip_tickets table we will create a new entry in this table
// the form type will be trip_tickets, reference_id will be the id from the created trip_tickets data

import { pgEnum, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { createInsertSchema, createUpdateSchema } from 'drizzle-zod';
import { usersTable } from './users.schema';

// form_type is the referenced form table name (edit as needed) NOTE: after adding a form type you have to generate and migrate the schema again
export const formTypeEnum = pgEnum('form_type', [
  'dispatch',
  'trip_tickets',
  'census',
]);
export const formStatusEnum = pgEnum('status', [
  'pending',
  'approved',
  'rejected',
]);

export const formSubmissionsTable = pgTable('form_submissions', {
  id: uuid().primaryKey().defaultRandom(),

  form_type: formTypeEnum().notNull(), // form type (dispatch, trip_tickets, census, etc.)
  reference_id: uuid().notNull(), // point to the id of the associated form type
  status: formStatusEnum().notNull().default('pending'), // status for the form submission

  submitted_by: uuid().references(() => usersTable.id, {
    onDelete: 'set null',
  }), // user who submitted the form (staff)
  reviewed_by: uuid().references(() => usersTable.id, { onDelete: 'set null' }), // user who review it (admin)

  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
}).enableRLS();

// use this for type inference for arguments
export type FormSubmission = typeof formSubmissionsTable.$inferSelect;
export type NewFormSubmission = typeof formSubmissionsTable.$inferInsert;

// use this for validating data in the server
export const NewFormSubmissionSchema = createInsertSchema(formSubmissionsTable);
export const UpdateFormSubmissionSchema =
  createUpdateSchema(formSubmissionsTable);
