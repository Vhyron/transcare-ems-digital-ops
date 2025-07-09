'use server';

import { eq, sql } from 'drizzle-orm';
import { db } from '../db';
import {
  formSubmissionsTable,
  NewFormSubmission,
} from '../db/schema/form_submissions.schema';

export async function listAllFormSubmissions() {
  return await db.select().from(formSubmissionsTable);
}

export async function getPendingFormSubmissions() {
  return await db
    .select()
    .from(formSubmissionsTable)
    .where(eq(formSubmissionsTable.status, 'pending'));
}

export async function listPendingForms() {
  const pendingSubmissions = await db
    .select()
    .from(formSubmissionsTable)
    .where(eq(formSubmissionsTable.status, 'pending'));

  const grouped = pendingSubmissions.reduce((acc, submission) => {
    if (!acc[submission.form_type]) acc[submission.form_type] = [];
    acc[submission.form_type].push(submission);
    return acc;
  }, {} as Record<string, any[]>);

  const results: any[] = [];

  for (const [formType, submissions] of Object.entries(grouped)) {
    const referenceIds = submissions
      .map((s) => `'${s.reference_id}'`)
      .join(',');
    if (!referenceIds) continue;
    const referencedForms = await db.execute(
      sql`SELECT * FROM ${sql.raw(formType)} WHERE id IN (${sql.raw(
        referenceIds
      )})`
    );

    const refMap = Object.fromEntries(
      referencedForms.map((f: any) => [f.id, f])
    );

    for (const submission of submissions) {
      results.push({
        ...submission,
        referenced_form: refMap[submission.reference_id] || null,
      });
    }
  }

  return results;
}

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
