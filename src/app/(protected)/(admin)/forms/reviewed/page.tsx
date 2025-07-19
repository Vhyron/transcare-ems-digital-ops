import { listReviewedForms } from '@/actions/form_submissions.action';
import { DataTable } from '@/components/table/data-table';
import { columns } from './columns';
import { reviewedFormStatus } from '../data';

const ReviewedFormsPage = async () => {
  const data = await listReviewedForms();

  return (
    <>
      <div className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight">Reviewed Forms</h1>
        <p className="text-muted-foreground">
          A comprehensive list of all submitted forms that has been reviewed.
          You can view details or manage reviewed forms.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={data}
        searchPlaceholder="Filter form types and submitted by..."
        filters={[
          { columnKey: 'status', title: 'Status', options: reviewedFormStatus },
        ]}
      />
    </>
  );
};

export default ReviewedFormsPage;
