import {
  pgTable,
  uuid,
  varchar,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";

export const hospitalTripTickets = pgTable("hospital_trip_tickets", {
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

  remarks: varchar({ length: 1000 }),

  // Signatures
  sig_nurse: varchar({ length: 10000 }),
  sig_billing: varchar({ length: 10000 }),
  sig_ambulance: varchar({ length: 10000 }),

  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
}).enableRLS();

export type HospitalTripTicket = typeof hospitalTripTickets.$inferSelect;
export type NewHospitalTripTicket = typeof hospitalTripTickets.$inferInsert;

export const NewHospitalTripTicketSchema = createInsertSchema(hospitalTripTickets);
export const UpdateHospitalTripTicketSchema = createUpdateSchema(hospitalTripTickets);
