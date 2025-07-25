'use client';

import { ListFormType } from '@/actions/form_submissions.action';
import ReviewedFormAction from '@/components/table-action/ReviewedFormAction';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { ColumnDef } from '@tanstack/react-table';
import { formatDate } from 'date-fns';
import { Check, CircleX } from 'lucide-react';
import { reviewedFormStatus } from '../data';

export const columns: ColumnDef<ListFormType>[] = [
  {
    id: 'form_type',
    accessorFn: (row) => row.form_submissions.form_type,
    enableGlobalFilter: false,
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
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: 'Submitted By',
    accessorFn: (row) => row.submitted_by.email,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Submitted By" />
    ),
    cell: ({ row }) => {
      return row.original.submitted_by.email;
    },
  },
  {
    id: 'status',
    accessorFn: (row) => row.form_submissions.status,
    enableGlobalFilter: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = reviewedFormStatus.find(
        (status) => status.value === row.getValue('status')
      );

      if (!status) {
        return null;
      }

      return (
        <span className="capitalize flex items-center gap-1.5">
          {row.original.form_submissions.status === 'approved' ? (
            <Check className="size-5 text-green-500" />
          ) : (
            <CircleX className="size-5 text-red-500" />
          )}
          {row.original.form_submissions.status}
        </span>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: 'Date Submitted',
    accessorFn: (row) => row.form_submissions.created_at,
    enableGlobalFilter: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date Submitted" />
    ),
    cell: ({ row }) => {
      const date = row.original.form_submissions.created_at;

      return formatDate(date, 'MMMM dd, yyyy - hh:mm a');
    },
  },
  {
    id: 'Date Reviewed',
    accessorFn: (row) => row.form_submissions.updated_at,
    enableGlobalFilter: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date Reviewed" />
    ),
    cell: ({ row }) => {
      const date = row.original.form_submissions.updated_at;

      return formatDate(date, 'MMMM dd, yyyy - hh:mm a');
    },
  },
  {
    id: 'Action',
    enableGlobalFilter: false,
    cell: ({ row }) => (
      <ReviewedFormAction formSubmission={row.original.form_submissions} />
    ),
  },
];
