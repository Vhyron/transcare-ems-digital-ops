'use client';

import { AllFormType } from '@/actions/form_submissions.action';
import PendingFormAction from '@/components/table-action/PendingFormAction';
import ReviewedFormAction from '@/components/table-action/ReviewedFormAction';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { ColumnDef } from '@tanstack/react-table';
import { formatDate } from 'date-fns';
import { Check, CircleX, ClockFading } from 'lucide-react';

export const columns: ColumnDef<AllFormType>[] = [
  {
    id: 'Form Type',
    accessorFn: (row) =>
      `${row.form_submissions.form_type.split('_').join(' ')}`,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Form Type" />
    ),
    cell: ({ row }) => {
      return (
        <span className="capitalize">
          {row.original.form_submissions.form_type.split('_').join(' ')}
        </span>
      );
    },
  },
  {
    id: 'Submitted By',
    accessorFn: (row) => `${row.submitted_by.email}`,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Submitted By" />
    ),
    cell: ({ row }) => {
      return row.original.submitted_by.email;
    },
  },
  {
    id: 'Status',
    accessorFn: (row) => `${row.form_submissions.status}`,
    enableGlobalFilter: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      return (
        <span className="capitalize flex items-center gap-1.5">
          {row.original.form_submissions.status === 'approved' ? (
            <Check className="size-5 text-green-500" />
          ) : row.original.form_submissions.status === 'rejected' ? (
            <CircleX className="size-5 text-red-500" />
          ) : (
            <ClockFading className="size-5 text-yellow-500" />
          )}
          {row.original.form_submissions.status}
        </span>
      );
    },
  },
  {
    id: 'Date Submitted',
    accessorFn: (row) => `${row.form_submissions.created_at}`,
    enableGlobalFilter: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date Submitted" />
    ),
    cell: ({ row }) => {
      const date = row.original.form_submissions.created_at;

      return formatDate(date, 'MMMM dd, yyyy');
    },
  },
  {
    id: 'Action',
    enableGlobalFilter: false,
    cell: ({ row }) =>
      row.original.form_submissions.status === 'pending' ? (
        <PendingFormAction
          formSubmission={row.original.form_submissions}
          formData={row.original.referenceForm}
        />
      ) : (
        <ReviewedFormAction
          formSubmission={row.original.form_submissions}
          formData={row.original.referenceForm}
        />
      ),
  },
];
