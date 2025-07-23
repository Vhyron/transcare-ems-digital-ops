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

export type PendingFormType = {
  form_submissions: FormSubmission;
  submitted_by: User;
  referenceForm: Record<string, unknown>;
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

  const forms = [];
  for (const form of pendingSubmissions) {
    const formType = form.form_submissions.form_type;
    const referenceId = form.form_submissions.reference_id;

    const query = sql.raw(
      `SELECT * FROM "${formType}" WHERE id = '${referenceId}'`
    );

    const referenceForm = await db.execute(query);
    forms.push({ ...form, referenceForm: referenceForm[0] || null });
  }

  return forms;
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

  const pendingSubmissions = await db
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

  const forms = [];
  for (const form of pendingSubmissions) {
    const formType = form.form_submissions.form_type;
    const referenceId = form.form_submissions.reference_id;

    const query = sql.raw(
      `SELECT * FROM "${formType}" WHERE id = '${referenceId}'`
    );

    const referenceForm = await db.execute(query);
    forms.push({ ...form, referenceForm: referenceForm[0] || null });
  }

  return forms;
}

export interface AllFormType extends PendingFormType {
  reviewed_by?: User | null;
}
export async function listAllForms(): Promise<AllFormType[]> {
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

  const pendingSubmissions = await db
    .select()
    .from(formSubmissionsTable)
    .orderBy(desc(formSubmissionsTable.created_at))
    .innerJoinLateral(submittedByQuery, sql`true`)
    .leftJoinLateral(reviewedByQuery, sql`true`);

  const forms = [];
  for (const form of pendingSubmissions) {
    const formType = form.form_submissions.form_type;
    const referenceId = form.form_submissions.reference_id;

    const query = sql.raw(
      `SELECT * FROM "${formType}" WHERE id = '${referenceId}'`
    );

    const referenceForm = await db.execute(query);
    forms.push({ ...form, referenceForm: referenceForm[0] || null });
  }

  return forms;
}

export async function listAllFormsPaginate(
  page: number,
  limit: number,
  search?: string,
  statusFilter?: "pending" | "approved" | "rejected"
): Promise<{ forms: AllFormType[]; total: number }> {
  const offset = (page - 1) * limit;

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

  let query = db
    .select()
    .from(formSubmissionsTable)
    .orderBy(desc(formSubmissionsTable.created_at))
    .innerJoinLateral(submittedByQuery, sql`true`)
    .leftJoinLateral(reviewedByQuery, sql`true`)
    .limit(limit)
    .offset(offset);

  if (search) {
    query = query.where(
      or(
        sql`"${formSubmissionsTable.form_type}" ILIKE ${`%${search}%`}`,
        sql`"${formSubmissionsTable.submitted_by}" ILIKE ${`%${search}%`}`
      )
    );
  }

  if (statusFilter) {
    query = query.where(eq(formSubmissionsTable.status, statusFilter));
  }

  const forms = await query;

  const totalQuery = db
    .select({ count: sql<number>`COUNT(*)` })
    .from(formSubmissionsTable);

  if (search) {
    totalQuery.where(
      or(
        sql`"${formSubmissionsTable.form_type}" ILIKE ${`%${search}%`}`,
        sql`"${formSubmissionsTable.submitted_by}" ILIKE ${`%${search}%`}`
      )
    );
  }

  if (statusFilter) {
    totalQuery.where(eq(formSubmissionsTable.status, statusFilter));
  }

  const [{ count }] = await totalQuery;

  return { forms, total: Number(count) };
}
