import NewStaffForm from "../../../../../components/forms/NewStaffForm";

const NewStaffPage = () => {
  return (
    <>
      <div className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight">Add New Staff</h1>
        <p className="text-muted-foreground">
          Fill out the form below to add a new staff member to the system. All
          required fields are marked with an asterisk (*).
        </p>
      </div>

      <NewStaffForm />
    </>
  );
};

export default NewStaffPage;
