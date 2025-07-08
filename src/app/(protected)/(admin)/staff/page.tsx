'use client';

import Loading from '@/components/Loading';
import { useStaffs } from '@/hooks/use-user';
import { columns } from './columns';
import { DataTable } from './data-table';

const StaffPage = () => {
  const { data = [], error, isLoading } = useStaffs();

  if (isLoading) return <Loading />;
  if (error) {
    return <div>Error loading staff data</div>;
  }

  return (
    <>
      <div className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight">All Staff</h1>
        <p className="text-muted-foreground">
          A comprehensive list of all staff members in the system. You can view
          details, manage staff accounts, or add new staff members.
        </p>
      </div>

      <DataTable columns={columns} data={data} />
    </>
  );
};

export default StaffPage;
