import { createClient } from "@supabase/supabase-js";

// Public anon key only — safe for the browser. Row Level Security in
// database/schema.sql is what actually protects the data, not this key.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export async function signUp(email: string, password: string) {
  return supabase.auth.signUp({ email, password });
}

export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function requestPasswordReset(email: string) {
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

const BUCKET_IMAGES_BUCKET = "bucket-images";

// Uploads a goal-bucket photo straight from the browser to Supabase Storage
// (no backend round trip needed) and returns its public URL.
export async function uploadBucketImage(file: File, householdId: string): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${householdId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET_IMAGES_BUCKET).upload(path, file, { upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET_IMAGES_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
