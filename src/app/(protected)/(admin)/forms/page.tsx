'use client';

import Loading from '@/components/Loading';
import { ServerDataTable } from '@/components/table/server-data-table';
import { useAllFormsPaginate } from '@/hooks/react-queries/use-form';
import { columns } from './columns';
import { allFormStatus } from './data';
import { useSearchParams } from 'next/navigation';

const AllFormsPage = () => {
  const searchParams = useSearchParams();
  
  const rawPage = searchParams.get('page');
  const rawLimit = searchParams.get('limit');
  const search = searchParams.get('search') || '';
  const statusFilter = searchParams.get('status') || '';
  
  const page = Math.max(1, Number(rawPage) || 1);
  const limit = Math.min(Math.max(20, Number(rawLimit) || 20), 100); // Max 100 items per page
  
  const {
    data = { forms: [], total: 0 },
    error,
    isLoading,
    isFetching,
  } = useAllFormsPaginate({ page, limit, search, statusFilter });

  if (isLoading) return <Loading />;
  if (error) {
    return <div>Error loading all forms data</div>;
  }

  return (
    <>
      <div className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight">All Forms</h1>
        <p className="text-muted-foreground">
          A comprehensive list of all submitted forms. You can view details,
          approve or reject submissions.
        </p>
      </div>

      <div className={`relative ${isFetching ? 'opacity-50' : ''}`}>
        <ServerDataTable
          columns={columns}
          data={data.forms}
          total={data.total}
          currentPage={page}
          pageSize={limit}
          searchPlaceholder="Filter form types and submitted by..."
          filters={[
            { columnKey: 'status', title: 'Status', options: allFormStatus },
          ]}
        />
        {isFetching && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50">
            <Loading />
          </div>
        )}
      </div>
    </>
  );
};

export default AllFormsPage;
