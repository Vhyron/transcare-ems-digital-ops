'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '../lib/supabase/server';
import { redirect } from 'next/navigation';
import { NewStaffFormData } from '../components/forms/NewStaffForm';
import { updateUser } from './users.action';
import { supabaseAdmin } from '@/lib/supabase/admin_client';

export async function login(data: { email: string; password: string }) {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.signInWithPassword(data);

  if (error) {
    console.error('Login Error: ', error);
    return { error: error.message };
  }

  if (!user) {
    return { error: 'User not found' };
  }

  revalidatePath('/', 'layout');

  const role = user.user_metadata?.user_role;

  switch (role) {
    case 'admin':
      redirect('/admin-dashboard');
      break;
    case 'staff':
      redirect('/staff-dashboard');
      break;
    default:
      console.warn('Unrecognized user role:', role);
  }

  return { error: null };
}

export async function createUser(data: NewStaffFormData) {
  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.admin.createUser({
    email: data.email,
    password: data.confirmPassword,
    user_metadata: {
      firstName: data.firstName,
      lastName: data.lastName,
      user_role: 'staff',
    },
    email_confirm: true,
  });

  if (error) {
    console.error('Create User Error: ', error);
    return { error: error.message, data: null };
  }

  if (user && (data.firstName || data.lastName)) {
    const updatedUser = await updateUser(user.id, {
      first_name: data.firstName,
      last_name: data.lastName,
    });

    if (updatedUser?.error) {
      return { error: 'User created but failed to add metadata.', data: null };
    }
  }

  revalidatePath('/', 'layout');

  return { data: user, error: null };
}

export async function createAdmin({
  email,
  password = 'admin123',
  firstName = 'Admin',
  lastName = 'User',
}: {
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
}) {
  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.admin.createUser({
    email: email,
    password: password,
    user_metadata: {
      firstName: firstName,
      lastName: lastName,
      user_role: 'admin',
    },
    email_confirm: true,
  });

  if (error) {
    console.error('Create User Error: ', error);
    return { error: error.message, data: null };
  }

  if (user) {
    console.log('Updating user in DB');
    const updatedUser = await updateUser(user.id, {
      first_name: firstName,
      last_name: lastName,
      user_role: 'admin',
    });

    if (updatedUser?.error) {
      return { error: 'User created but failed to add metadata.', data: null };
    }
  }

  return { data: user, error: null };
}

export async function logout() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Logout Error: ', error);
    return error;
  }

  revalidatePath('/', 'layout');
  redirect('/');
}
