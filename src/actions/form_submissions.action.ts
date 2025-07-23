'use server';

import { desc, eq, or, sql } from 'drizzle-orm';
import { db } from '../db';
import {
  FormSubmission,
  formSubmissionsTable,
  NewFormSubmission,
  UpdateFormSubmissionSchema,
} from '../db/schema/form_submissions.schema';
import { User, usersTable } from '../db/schema/users.schema';
import { revalidatePath } from 'next/cache';

export async function listAllFormSubmissions() {
  return await db.select().from(formSubmissionsTable);
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
  try {
    const validated = UpdateFormSubmissionSchema.safeParse(data);

    if (validated?.error) {
      return { error: `Validation error: ${validated.error.message}` };
    }

    const [updated] = await db
      .update(formSubmissionsTable)
      .set(data)
      .where(eq(formSubmissionsTable.id, id))
      .returning();

    revalidatePath('/forms');

    return { data: updated };
  } catch (error) {
    return { error: `Failed to update form submission: ${error}` };
  }
}

export async function deleteFormSubmission(id: string) {
  const [deleted] = await db
    .delete(formSubmissionsTable)
    .where(eq(formSubmissionsTable.id, id))
    .returning();

  revalidatePath('/forms');

  return deleted;
}

export async function fetchReferenceForm(
  formType: string,
  referenceId: string
): Promise<any> {
  try {
    const query = sql.raw(
      `SELECT * FROM "${formType}" WHERE id = '${referenceId}'`
    );

    const result = await db.execute(query);
    return result[0] || null;
  } catch (error) {
    console.error(`Failed to fetch reference form: ${error}`);
    return null;
  }
}

export type PendingFormType = {
  form_submissions: FormSubmission;
  submitted_by: User;
};
export async function listPendingForms(): Promise<PendingFormType[]> {
  const submittedByQuery = db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, formSubmissionsTable.submitted_by))
    .as('submitted_by');

  const pendingSubmissions = await db
    .select()
    .from(formSubmissionsTable)
    .where(eq(formSubmissionsTable.status, 'pending'))
    .orderBy(desc(formSubmissionsTable.created_at))
    .innerJoinLateral(submittedByQuery, sql`true`);

  return pendingSubmissions;
}

export interface ReviewedFormType extends PendingFormType {
  reviewed_by: User;
}
export async function listReviewedForms(): Promise<ReviewedFormType[]> {
  const submittedByQuery = db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, formSubmissionsTable.submitted_by))
    .as('submitted_by');
  const reviewedByQuery = db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, formSubmissionsTable.reviewed_by))
    .as('reviewed_by');

  const reviewedSubmissions = await db
    .select()
    .from(formSubmissionsTable)
    .where(
      or(
        eq(formSubmissionsTable.status, 'approved'),
        eq(formSubmissionsTable.status, 'rejected')
      )
    )
    .orderBy(desc(formSubmissionsTable.updated_at))
    .innerJoinLateral(submittedByQuery, sql`true`)
    .innerJoinLateral(reviewedByQuery, sql`true`);

  return reviewedSubmissions;
}

export interface AllFormType {
  form_submissions: FormSubmission;
  submitted_by: User;
}
export async function listAllForms(): Promise<AllFormType[]> {
  const submittedByQuery = db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, formSubmissionsTable.submitted_by))
    .as('submitted_by');

  const forms = await db
    .select()
    .from(formSubmissionsTable)
    .orderBy(desc(formSubmissionsTable.created_at))
    .innerJoinLateral(submittedByQuery, sql`true`)

  return forms;
}
