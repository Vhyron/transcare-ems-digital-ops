'use client';

import { X } from 'lucide-react';
import { useState, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ServerDataTableFacetedFilter } from './server-data-table-faceted-filter';

interface ServerDataTableToolbarProps {
  searchPlaceholder?: string;
  actionComponent?: React.ReactNode;
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

export function ServerDataTableToolbar({
  searchPlaceholder = 'Search...',
  actionComponent,
  filters,
}: ServerDataTableToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchInput, setSearchInput] = useState(
    searchParams.get('search') || ''
  );
  const currentSearch = searchParams.get('search') || '';
  const currentStatus = searchParams.get('status') || '';

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());

    if (searchInput.trim()) {
      params.set('search', searchInput.trim());
    } else {
      params.delete('search');
    }

    // Reset to page 1 when searching
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const handleStatusFilter = (value: string | undefined) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value && value !== 'all') {
      params.set('status', value);
    } else {
      params.delete('status');
    }

    // Reset to page 1 when filtering
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const clearSearch = () => {
    setSearchInput('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('search');
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const clearStatus = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('status');
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const isFiltered = currentSearch || currentStatus;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <form
          onSubmit={handleSearchSubmit}
          className="flex items-center space-x-2"
        >
          <Input
            placeholder={searchPlaceholder}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-8 w-[150px] lg:w-[250px]"
          />
          {/* <Button type="submit" size="sm" variant="outline">
            Search
          </Button> */}
          {currentSearch && (
            <Button
              type="button"
              variant="ghost"
              onClick={clearSearch}
              className="h-8 px-2 lg:px-3"
            >
              Clear
              <X className="ml-2 h-4 w-4" />
            </Button>
          )}
        </form>

        {filters &&
          filters.map((filter) => {
            if (filter.columnKey === 'status') {
              return (
                <div
                  key={filter.columnKey}
                  className="flex items-center space-x-2"
                >
                  <ServerDataTableFacetedFilter
                    title={filter.title}
                    options={filter.options}
                    selectedValue={currentStatus}
                    onValueChange={handleStatusFilter}
                  />
                  {currentStatus && (
                    <Button
                      variant="ghost"
                      onClick={clearStatus}
                      className="h-8 px-2 lg:px-3"
                    >
                      Reset Status
                      <X className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
              );
            }
            return null;
          })}

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
              setSearchInput('');
              const params = new URLSearchParams();
              params.set('page', '1');
              params.set('limit', searchParams.get('limit') || '10');
              router.push(`?${params.toString()}`);
            }}
            className="h-8 px-2 lg:px-3"
          >
            Reset All
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      {actionComponent && (
        <div className="flex items-center space-x-2">{actionComponent}</div>
      )}
    </div>
  );
}
