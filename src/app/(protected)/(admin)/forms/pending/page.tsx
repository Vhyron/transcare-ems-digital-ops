import { listPendingForms } from '@/actions/form_submissions.action';
import { DataTable } from '@/components/table/data-table';
import { formTypes } from '../data';
import { columns } from './columns';

const PendingFormsPage = async () => {
  const data = await listPendingForms();

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
        searchPlaceholder="Filter submitted by..."
        filters={[{ columnKey: 'form_type', title: 'Form Type', options: formTypes }]}
      />
    </>
  );
};

export default PendingFormsPage;
