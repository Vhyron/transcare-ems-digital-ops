import { createClient } from './client';

// Upload file using standard upload
export async function uploadFile({
  storage,
  path,
  file,
}: {
  storage: string;
  path: string;
  file: Blob;
}) {
  const supabase = createClient();

  const { data, error } = await supabase.storage
    .from(storage)
    .upload(path, file, { upsert: true });

  if (error) {
    return error;
  } else {
    return data;
  }
}

export async function getPrivateFileUrl({
  storage,
  path,
}: {
  storage: string;
  path: string;
}) {
  const supabase = createClient();

  const { data, error } = await supabase.storage
    .from(storage)
    .createSignedUrl(path, 3600);

  if (error) {
    return error;
  } else {
    return data.signedUrl;
  }
}

export function getFileUrl({
  storage,
  path,
}: {
  storage: string;
  path: string;
}) {
  const supabase = createClient();

  const { data } = supabase.storage.from(storage).getPublicUrl(path);

  if (!data) {
    return new Error('Failed to get file URL');
  }

  return data.publicUrl;
}
