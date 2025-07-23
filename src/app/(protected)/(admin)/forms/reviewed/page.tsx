'use client';

import Loading from '@/components/Loading';
import { DataTable } from '@/components/table/data-table';
import { useReviewedForms } from '@/hooks/react-queries/use-form';
import { reviewedFormStatus } from '../data';
import { columns } from './columns';

const ReviewedFormsPage = () => {
  const { data = [], error, isLoading } = useReviewedForms();

  if (isLoading) return <Loading />;
  if (error) {
    return <div>Error loading reviewed forms data</div>;
  }

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
