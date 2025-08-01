import { pgTable, uuid, varchar, timestamp, text } from 'drizzle-orm/pg-core';
import { createInsertSchema, createUpdateSchema } from 'drizzle-zod';

export const HOSPITAL_TRIP_TICKETS_TABLE = 'hospital_trip_tickets';
export const hospitalTripTickets = pgTable(HOSPITAL_TRIP_TICKETS_TABLE, {
  id: uuid().primaryKey().defaultRandom(),

  // Trip Info
  date: varchar({ length: 20 }).notNull(),
  time: varchar({ length: 20 }).notNull(),
  room: varchar({ length: 50 }),
  trip_type: varchar({ length: 20 }),

  vehicle: varchar({ length: 50 }),
  plate: varchar({ length: 20 }),
  age_sex: varchar({ length: 20 }),

  patient_name: varchar({ length: 100 }),
  purpose: varchar({ length: 100 }),
  pickup: varchar({ length: 100 }),
  destination: varchar({ length: 100 }),

  // Billing
  billing_class: varchar({ length: 20 }),
  tare: varchar({ length: 20 }),
  billing_type: varchar({ length: 20 }),

  gross: varchar({ length: 20 }),
  discount: varchar({ length: 20 }),
  payables: varchar({ length: 20 }),
  vat: varchar({ length: 20 }),
  vatables: varchar({ length: 20 }),
  zero_vat: varchar({ length: 20 }),
  withholding: varchar({ length: 20 }),

  remarks: text(),

  // Signatures
  sig_nurse: text(),
  sig_billing: text(),
  sig_ambulance: text(),

  // Signature paths
  sig_nurse_path: text(),
  sig_billing_path: text(),
  sig_ambulance_path: text(),

  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
}).enableRLS();

export type HospitalTripTicket = typeof hospitalTripTickets.$inferSelect;
export type NewHospitalTripTicket = typeof hospitalTripTickets.$inferInsert;

export const NewHospitalTripTicketSchema =
  createInsertSchema(hospitalTripTickets);
export const UpdateHospitalTripTicketSchema =
  createUpdateSchema(hospitalTripTickets);
