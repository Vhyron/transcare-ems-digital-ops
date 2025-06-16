"use server";

import { db } from "@/db";
import { NewUser, usersTable } from "@/db/schema/users.schema";
import { eq } from "drizzle-orm";

export async function getUserById(id: string) {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, id))
    .limit(1);
  return user;
}

export async function getUserByEmail(email: string) {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);
  return user;
}

export async function createUser(user: NewUser) {
  const [newUser] = await db.insert(usersTable).values(user).returning();
  return newUser;
}

export async function updateUser(id: string, data: Partial<NewUser>) {
  const [updatedUser] = await db
    .update(usersTable)
    .set(data)
    .where(eq(usersTable.id, id))
    .returning();
  return updatedUser;
}

export async function deleteUser(id: string) {
  const [deletedUser] = await db
    .delete(usersTable)
    .where(eq(usersTable.id, id))
    .returning();
  return deletedUser;
}
