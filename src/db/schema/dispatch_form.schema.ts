import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  jsonb,
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createUpdateSchema } from 'drizzle-zod';

export const DISPATCH_FORM_TABLE = 'dispatch_forms';
export const dispatchForms = pgTable(DISPATCH_FORM_TABLE, {
  id: uuid().primaryKey().defaultRandom(),

  // Timestamps
  created_at: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp({ withTimezone: true }).defaultNow().notNull(),

  // Page 1 Fields - Event Information
  event_title: text(),
  event_type: text(),
  event_owner: text(),
  event_owner_contact: text(),
  event_organizer: text(),
  event_organizer_contact: text(),
  event_date_time: text(),
  event_duration: text(),
  event_call_time: text(),
  estimated_crowd: text(),
  event_venue: text(),
  type_of_events: text(),
  venue_type: text(),
  brief_concept_description: text(),
  expected_vip_guest: text(),

  // Crowd Management
  crowd_access: text(),
  crowd_security: text(),
  crowd_risk: text(),
  crowd_others: text(),

  // Crowd Information
  economic_class: text(),
  crowd_type: text(),
  venue_safety_equipment: text(),

  // Page 2 Fields - Service Details
  type_of_service: text(),
  type_of_service_other: text(),
  crew_credential: text(),
  crew_credential_other: text(),
  number_of_crew: text(),

  // Array fields stored as JSONB
  ambulance_models: jsonb()
    .$type<
      Array<{
        model: string;
        plate_number: string;
        type: string;
      }>
    >()
    .default([]),
  md_names: jsonb().$type<string[]>().default([]),
  point_of_destinations: jsonb().$type<string[]>().default([]),

  special_consideration: text(),

  // Patient Census - Treated
  treated_trauma: integer().default(0),
  treated_medical: integer().default(0),
  treated_rate_1: text(),
  treated_rate_2: text(),
  treated_waiver: text(),

  // Patient Census - Transported
  transported_trauma: integer().default(0),
  transported_medical: integer().default(0),
  transported_rate_1: text(),
  transported_rate_2: text(),
  transported_insurance: text(),

  // Patient Census - Refused
  refused_trauma: integer().default(0),
  refused_medical: integer().default(0),
  refused_rate_1: text(),
  refused_rate_2: text(),
  refused_pre_med_check: text(),

  // Time Tracking - Dispatch
  dispatch_hrs: text(),
  dispatch_min: text(),
  dispatch_reading: text(),

  // Time Tracking - On Scene
  on_scene_hrs: text(),
  on_scene_min: text(),
  on_scene_reading: text(),

  // Time Tracking - Departure
  departure_hrs: text(),
  departure_min: text(),
  departure_reading: text(),

  // Time Tracking - Arrival
  arrival_hrs: text(),
  arrival_min: text(),
  arrival_reading: text(),

  // Time Tracking - Totals
  working_time_hrs: text(),
  working_time_min: text(),
  travel_time_hrs: text(),
  travel_time_min: text(),
  overall_hrs: text(),
  overall_min: text(),

  // Page 2 Signatures (Base64 encoded images)
  team_leader_signature: text(),
  client_representative_signature: text(),
  ems_supervisor_signature: text(),

  // Page 3 Fields
  page3_event_title: text(),
  page3_total_crew: integer(),

  // Crew Data stored as JSONB
  crew_data: jsonb()
    .$type<
      Array<{
        name: string;
        title: string;
        position: string;
        time_in: string;
        time_out: string;
        signature: string;
      }>
    >()
    .default([]),

  // Page 3 Signatures
  page3_team_leader_signature: text(),
  page3_client_representative_signature: text(),
  page3_ems_supervisor_signature: text(),

  form_status: varchar({ length: 20 }).default('draft'),
  current_page: integer().default(1),
}).enableRLS();

export type DispatchForm = typeof dispatchForms.$inferSelect;
export type NewDispatchForm = typeof dispatchForms.$inferInsert;

export const NewDispatchFormSchema = createInsertSchema(dispatchForms);
export const UpdateDispatchFormSchema = createUpdateSchema(dispatchForms);
