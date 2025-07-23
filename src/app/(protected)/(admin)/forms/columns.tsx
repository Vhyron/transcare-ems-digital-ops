'use client';

import PendingFormAction from '@/components/table-action/PendingFormAction';
import ReviewedFormAction from '@/components/table-action/ReviewedFormAction';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { ColumnDef } from '@tanstack/react-table';
import { formatDate } from 'date-fns';
import { Check, CircleX, ClockFading } from 'lucide-react';
import { AllFormType } from '../../../../actions/form_submissions.action';
import { allFormStatus } from './data';

export const columns: ColumnDef<AllFormType>[] = [
  {
    id: 'form_type',
    enableColumnFilter: true,
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
    enableColumnFilter: true,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = allFormStatus.find(
        (status) => status.value === row.getValue('status')
      );

      if (!status) {
        return null;
      }

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
    enableSorting: false,
    header: 'Date Reviewed',
    cell: ({ row }) => {
      const isPending = row.original.form_submissions.status === 'pending';
      if (isPending) return '-';

      const date = row.original.form_submissions.updated_at;

      return formatDate(date, 'MMMM dd, yyyy - hh:mm a');
    },
  },
  {
    id: 'Action',
    enableGlobalFilter: false,
    cell: ({ row }) =>
      row.original.form_submissions.status === 'pending' ? (
        <PendingFormAction
          formSubmission={row.original.form_submissions}
        />
      ) : (
        <ReviewedFormAction
          formSubmission={row.original.form_submissions}
        />
      ),
  },
];
