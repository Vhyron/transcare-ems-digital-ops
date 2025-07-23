'use client';

import Loading from '@/components/Loading';
import { DataTable } from '@/components/table/data-table';
import { usePendingForms } from '@/hooks/react-queries/use-form';
import { columns } from './columns';

const PendingFormsPage = () => {
  const { data = [], error, isLoading } = usePendingForms();

  if (isLoading) return <Loading />;
  if (error) {
    return <div>Error loading pending forms data</div>;
  }

  return (
    <>
      <div className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight">Pending Forms</h1>
        <p className="text-muted-foreground">
          A comprehensive list of all submitted forms awaiting review. You can
          view details, approve or reject submissions.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={data}
        searchPlaceholder="Filter form types and submitted by..."
      />
    </>
  );
};

export default PendingFormsPage;
