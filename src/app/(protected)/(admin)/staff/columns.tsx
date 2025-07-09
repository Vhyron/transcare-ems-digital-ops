'use client';

import { StaffAction } from '@/components/table-action/StaffAction';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User } from '@/db/schema/users.schema';
import { ColumnDef } from '@tanstack/react-table';
import { formatDate } from 'date-fns';

export const columns: ColumnDef<User>[] = [
  {
    id: 'name',
    accessorFn: (row) => `${row.first_name || ''} ${row.last_name || ''}`,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    filterFn: (row, _columnId, filterValue) => {
      const first = row.original.first_name || '';
      const last = row.original.last_name || '';
      const full = `${first} ${last}`.toLowerCase();
      return (
        first.toLowerCase().includes(filterValue.toLowerCase()) ||
        last.toLowerCase().includes(filterValue.toLowerCase()) ||
        full.includes(filterValue.toLowerCase())
      );
    },
    cell: ({ row }) => {
      const { first_name, last_name, email } = row.original;
      const getInitials = () => {
        if (first_name && last_name) {
          return `${first_name[0]}${last_name[0]}`;
        }
        if (email) {
          return email.substring(0, 2);
        }
        return '??';
      };

      return (
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarFallback>{getInitials().toUpperCase()}</AvatarFallback>
          </Avatar>
          <span>
            {first_name && last_name
              ? `${first_name} ${last_name}`
              : `@${email.split('@')[0]}`}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
  },
  {
    accessorKey: 'created_at',
    enableGlobalFilter: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
    ),
    cell: ({ row }) => {
      const date = row.getValue('created_at') as Date;

      return formatDate(date, 'MMMM dd, yyyy');
    },
  },
  {
    accessorKey: 'updated_at',
    enableGlobalFilter: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Updated At" />
    ),
    cell: ({ row }) => {
      const date = row.getValue('updated_at') as Date;

      return formatDate(date, 'MMMM dd, yyyy');
    },
  },
  {
    id: 'actions',
    enableGlobalFilter: false,
    cell: ({ row }) => <StaffAction user={row.original} />,
  },
];
