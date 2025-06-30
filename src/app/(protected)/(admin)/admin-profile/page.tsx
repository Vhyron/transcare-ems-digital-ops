'use client'

import ChangePasswordForm from "@/components/forms/ChangePasswordForm";
import ProfileInfoForm, { ProfileFormData } from "@/components/forms/ProfileInfoForm";
import Loading from "@/components/Loading";
import { useAuth } from "@/components/provider/auth-provider";
import { redirect } from "next/navigation";

const AdminAccount = () => {
  const { user, loading } = useAuth();

  if (loading) return <Loading />
  if (!user) return redirect('/unauthorized');

  const handleSubmit = (data: ProfileFormData) => {
    console.log(data);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Profile Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences</p>
      </div>

      <div className="grid gap-6">
        <ProfileInfoForm user={user} onSubmit={handleSubmit} />

        <ChangePasswordForm />

        {/* <Card>
          <CardHeader>
            <CardTitle>Delete Account</CardTitle>
            <CardDescription>
              Permanently delete your account and all data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive">Delete Account</Button>
          </CardContent>
        </Card> */}
      </div>
    </div>
  )
};

export default AdminAccount;
