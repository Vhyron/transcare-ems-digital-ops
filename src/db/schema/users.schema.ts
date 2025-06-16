import { pgEnum, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";

export const userRoleEnum = pgEnum("user_role", ["admin", "staff"]);

export const usersTable = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),

  first_name: varchar({ length: 50 }),
  last_name: varchar({ length: 50 }),
  email: varchar({ length: 255 }).notNull().unique(),
  // default role only for db trigger function, implementation should always set this
  user_role: userRoleEnum().notNull().default("staff"),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
}).enableRLS();

// use this for type inference for arguments
export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;

// use this for validating data in the server
export const NewUserSchema = createInsertSchema(usersTable);
export const UpdateUserSchema = createUpdateSchema(usersTable);
