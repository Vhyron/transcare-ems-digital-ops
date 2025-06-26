import { listAllStaff } from "../../../../actions/users.action";
import { columns } from "./columns";
import { DataTable } from "../../../../components/table/data-table";

const StaffPage = async () => {
  const staffs = await listAllStaff();

  if (!staffs) {
    return "Loading...";
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

      <DataTable columns={columns} data={staffs} />
    </>
  );
};

export default StaffPage;
