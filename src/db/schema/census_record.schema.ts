import {
  pgTable,
  uuid,
  varchar,
  text,
  date,
  time,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createUpdateSchema } from 'drizzle-zod';

export const OPERATION_CENSUS_RECORDS_TABLE = 'operation_census_records';

export const operationCensusRecords = pgTable(OPERATION_CENSUS_RECORDS_TABLE, {
  id: uuid().primaryKey().defaultRandom(),

  // General Info
  date: date().notNull(),
  event_owner: varchar({ length: 100 }),
  time_in: time({ precision: 0 }),
  time_out: time({ precision: 0 }),
  activity: varchar({ length: 200 }),
  location: varchar({ length: 200 }),

  // Dynamic patient data as array of objects
  form_data: jsonb().notNull(), // [{ name, age_sex, chief_complaint, vital_signs, management, signature }, ...]

  // Signatures
  prepared_by_signature: text(), // base64
  conformed_by_signature: text(), // base64

  // Metadata
  created_by: uuid().notNull(),
  created_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
}).enableRLS();

export type OperationCensusRecord = typeof operationCensusRecords.$inferSelect;
export type NewOperationCensusRecord =
  typeof operationCensusRecords.$inferInsert;

export const NewOperationCensusRecordSchema = createInsertSchema(
  operationCensusRecords
);
export const UpdateOperationCensusRecordSchema = createUpdateSchema(
  operationCensusRecords
);
