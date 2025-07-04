'use client';

import { ColumnDef } from '@tanstack/react-table';
import { formatDate } from 'date-fns';
import { User } from '@/db/schema/users.schema';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { StaffAction } from '@/components/StaffAction';

export const columns: ColumnDef<User>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
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
    cell: ({ row }) => <StaffAction user={row.original} />,
  },
];
