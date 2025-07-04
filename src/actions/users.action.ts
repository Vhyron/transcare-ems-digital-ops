'use server';

import { db } from '@/db';
import {
  NewUser,
  UpdateUserSchema,
  usersTable,
} from '@/db/schema/users.schema';
import { eq } from 'drizzle-orm';
import { supabaseAdmin } from '../lib/supabase/admin_client';

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

export async function listAllStaff() {
  return await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.user_role, 'staff'));
}

export async function createUser(user: NewUser) {
  const [newUser] = await db.insert(usersTable).values(user).returning();
  return newUser;
}

export async function updateUser(id: string, data: Partial<NewUser>) {
  const validated = UpdateUserSchema.safeParse(data);

  if (validated?.error) {
    return { error: validated.error };
  }

  const [updatedUser] = await db
    .update(usersTable)
    .set(validated.data)
    .where(eq(usersTable.id, id))
    .returning();

  return { data: updatedUser };
}

export async function deleteUser(id: string) {
  const [deletedUser] = await db
    .delete(usersTable)
    .where(eq(usersTable.id, id))
    .returning();
  return deletedUser;
}

export async function removeUser(id: string) {
  const res = await supabaseAdmin.auth.admin.deleteUser(id);
  if (res.error) {
    return { error: res.error, data: null };
  }

  return { data: res.data, error: null };
}
