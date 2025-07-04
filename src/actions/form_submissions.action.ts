'use server';

import { eq } from 'drizzle-orm';
import { db } from '../db';
import {
  formSubmissionsTable,
  NewFormSubmission,
} from '../db/schema/form_submissions.schema';

export async function listAllFormSubmissions() {
  return await db.select().from(formSubmissionsTable);
}

export async function listPendingFormSubmissions() {
  return await db
    .select()
    .from(formSubmissionsTable)
    .where(eq(formSubmissionsTable.status, 'pending'));
}

// TODO: add a raw sql query here utilizing the reference_id for forms

export async function createFormSubmission(formSubmission: NewFormSubmission) {
  const [inserted] = await db
    .insert(formSubmissionsTable)
    .values(formSubmission)
    .returning();

  return inserted;
}

export async function updateFormSubmission(
  id: string,
  data: Partial<NewFormSubmission>
) {
  const [updated] = await db
    .update(formSubmissionsTable)
    .set(data)
    .where(eq(formSubmissionsTable.id, id))
    .returning();

  return updated;
}

export async function deleteUser(id: string) {
  const [deleted] = await db
    .delete(formSubmissionsTable)
    .where(eq(formSubmissionsTable.id, id))
    .returning();

  return deleted;
}
