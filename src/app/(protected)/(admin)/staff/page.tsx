"use client";

import { columns } from "./columns";
import { DataTable } from "../../../../components/table/data-table";
import { useStaffs } from "../../../../hooks/use-user";
import Loading from "../../../../components/Loading";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const StaffPage = () => {
  const { data = [], error, isLoading } = useStaffs();

  if (isLoading) return <Loading />;
  if (error) {
    return <div>Error loading staff data</div>;
  }

  return (
    <>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">All Staff</h1>

        <p className="text-muted-foreground mt-1">
          Fill out the form below to add a new staff member to the system. All
          required fields are marked with an asterisk (*).
        </p>
      </div>

      <DataTable
        columns={columns}
        data={data}
        actionComponent={
          <Link href='/staff/new' className="w-fit">
            <Button size='sm'>
              <Plus />
              Add New Staff
            </Button>
          </Link>
        }
      />
    </>
  );
};

export default StaffPage;
