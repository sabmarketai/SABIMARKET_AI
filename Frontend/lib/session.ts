import { supabase } from "./supabase";

/**
 * Supabase's client is the single source of truth for the session (it
 * persists to localStorage and auto-refreshes). Reading through it instead
 * of a static sessionStorage token keeps every request tied to a valid,
 * non-expired access token.
 */
export async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export async function refreshAccessToken(): Promise<string | null> {
  const { data, error } = await supabase.auth.refreshSession();
  if (error) return null;
  return data.session?.access_token ?? null;
}

export async function getCurrentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
}

export async function clearSession(): Promise<void> {
  await supabase.auth.signOut();
}
