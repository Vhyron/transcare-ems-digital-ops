'use client';

import { Table } from '@tanstack/react-table';
import { X } from 'lucide-react';
import { DataTableFacetedFilter } from './data-table-faceted-filter';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { DataTableViewOptions } from './data-table-view';
import { useState } from 'react';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  actionComponent?: React.ReactNode;
  searchPlaceholder?: string;
  filters?: Array<{
    columnKey: string;
    title: string;
    options: {
      label: string;
      value: string;
      icon?: any;
    }[];
  }>;
}

export function DataTableToolbar<TData>({
  table,
  actionComponent,
  searchPlaceholder,
  filters,
}: DataTableToolbarProps<TData>) {
  const [globalFilter, setGlobalFilter] = useState('');
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center gap-2">
        <Input
          placeholder={searchPlaceholder || 'Search...'}
          value={globalFilter || ''}
          onChange={(e) => {
            table.setGlobalFilter(e.target.value as string);
            setGlobalFilter(e.target.value as string);
          }}
          className="max-w-xs"
        />
        {filters?.map(
          (filter) =>
            table.getColumn(filter.columnKey) && (
              <DataTableFacetedFilter
                key={filter.columnKey}
                column={table.getColumn(filter.columnKey)}
                title={filter.title}
                options={filter.options}
              />
            )
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => table.resetColumnFilters()}
          >
            Reset
            <X />
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <DataTableViewOptions table={table} />
        {actionComponent}
      </div>
    </div>
  );
}
