'use client'

import { updateUser } from "@/actions/users.action";
import ChangePasswordForm from "@/components/forms/ChangePasswordForm";
import ProfileInfoForm, { ProfileFormData } from "@/components/forms/ProfileInfoForm";
import Loading from "@/components/Loading";
import { useAuth } from "@/components/provider/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { redirect } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const AdminAccount = () => {
  const { user, loading } = useAuth();

  const [isLoading, setIsLoading] = useState(false);

  if (loading) return <Loading />
  if (!user) return redirect('/unauthorized');

  const handleUpdateUser = async (data: ProfileFormData) => {
    const supabase = createClient();
    setIsLoading(true);

    try {
      const res = await updateUser(user.id, {
        first_name: data.firstName,
        last_name: data.lastName,
        updated_at: new Date()
      });

      if (!res) {
        toast.error("Failed to update profile information")
      }

      const { error } = await supabase.auth.updateUser({ data: { firstName: data.firstName, lastName: data.lastName } })

      if (error) {
        toast.error("Failed to update profile information", {
          description: error.message
        })
      }

      toast.success("Profile information updated successfully");
    } catch (error) {
      console.error(error);
      toast.success("Failed to update profile information", {
        description: `An unexpected error occurred, Try again later.`
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Profile Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences</p>
      </div>

      <div className="grid gap-6">
        <ProfileInfoForm user={user} onSubmit={handleUpdateUser} loading={isLoading} />

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
