import { listAllForms } from '@/actions/form_submissions.action';
import { DataTable } from '@/components/table/data-table';
import { columns } from './columns';
import { allFormStatus, formTypes } from './data';

const AllFormsPage = async () => {
  const data = await listAllForms();

  return (
    <>
      <div className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight">All Forms</h1>
        <p className="text-muted-foreground">
          A comprehensive list of all submitted forms. You can view details,
          approve or reject submissions.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={data}
        searchPlaceholder="Filter submitted by..."
        filters={[
          { columnKey: 'status', title: 'Status', options: allFormStatus },
          { columnKey: 'form_type', title: 'Form Type', options: formTypes },
        ]}
      />
    </>
  );
};

export default AllFormsPage;
