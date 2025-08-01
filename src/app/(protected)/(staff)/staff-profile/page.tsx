'use client';

import { updateUser } from '@/actions/users.action';
import ChangePasswordForm, {
  ChangePasswordFormData,
} from '@/components/forms/ChangePasswordForm';
import ProfileInfoForm, {
  ProfileFormData,
} from '@/components/forms/ProfileInfoForm';
import Loading from '@/components/Loading';
import { useAuth } from '@/components/provider/auth-provider';
import { createClient } from '@/lib/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { redirect } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import SignatureForm, {
  SignatureData,
} from '../../../../components/forms/SignatureForm';
import { uploadFile } from '../../../../lib/supabase/storage';

const StaffProfile = () => {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();

  const [isLoading, setIsLoading] = useState(false);

  if (loading) return <Loading />;
  if (!user) return redirect('/unauthorized');

  const handleUpdateUser = async (data: ProfileFormData) => {
    setIsLoading(true);
    const supabase = createClient();

    try {
      const res = await updateUser(user.id, {
        first_name: data.firstName,
        last_name: data.lastName,
        updated_at: new Date(),
      });

      if (res?.error) {
        toast.error('Failed to update profile information');
      }

      const { error } = await supabase.auth.updateUser({
        data: { firstName: data.firstName, lastName: data.lastName },
      });

      if (error) {
        toast.error('Failed to update profile information', {
          description: error.message,
        });
      }

      queryClient.invalidateQueries({ queryKey: ['staffs'] }); // to reset the cache for staff

      toast.success('Profile information updated successfully');
    } catch (error) {
      console.error(error);
      toast.success('Failed to update profile information', {
        description: `An unexpected error occurred, Try again later.`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (data: ChangePasswordFormData) => {
    setIsLoading(true);
    const supabase = createClient();

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: data.currentPassword,
      });

      if (signInError) {
        toast.error('Failed to update password.', {
          description: 'Current password is incorrect.',
        });
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: data.confirmPassword,
      });

      if (error) {
        toast.error('Failed to update password', {
          description: error.message,
        });
        return;
      }

      toast.success('Changed password successfully');
    } catch (error) {
      console.error(error);
      toast.success('Failed to update password', {
        description: `An unexpected error occurred, Try again later.`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSignature = async (data: SignatureData) => {
    setIsLoading(true);
    const supabase = createClient();

    try {
      const upload = await uploadFile({
        storage: 'signatures',
        path: `staff/signature_${user.id}.png`, // we'll save the signature to the path(folder) of staff/ + signature_id
        file: data.signature,
      });

      if (upload instanceof Error || !upload) {
        toast.error('Failed to upload e-signature', {
          description: 'An error occurred while uploading the e-signature.',
          closeButton: true,
        });
        return;
      }

      const res = await updateUser(user.id, {
        signature: upload.path,
        updated_at: new Date(),
      });

      if (!res) {
        toast.error('Failed to update e-signature', {
          description: 'An error occurred while updating the e-signature.',
        });
      }

      const { error } = await supabase.auth.updateUser({
        data: { signature: upload.path },
      });

      if (error) {
        toast.error('Failed to update e-signature', {
          description: error.message,
        });
      }

      toast.success('E-signature updated successfully');
    } catch (error) {
      console.error(error);
      toast.success('Failed to update e-signature', {
        description: `An unexpected error occurred, Try again later.`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Staff Profile Settings
        </h1>
        <p className="text-muted-foreground">Manage your account preferences</p>
      </div>

      <div className="grid gap-6">
        <ProfileInfoForm
          user={user}
          onSubmit={handleUpdateUser}
          loading={isLoading}
        />

        <ChangePasswordForm
          onSubmit={handleChangePassword}
          loading={isLoading}
        />

        <SignatureForm
          onSubmit={handleUpdateSignature}
          defaultSignature={user.user_metadata.signature}
          loading={isLoading}
        />
      </div>
    </div>
  );
};

export default StaffProfile;
