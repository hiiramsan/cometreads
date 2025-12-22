import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const GET: APIRoute = async ({ url, redirect }) => {

  const provider = url.searchParams.get("provider") || 'github'

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider as 'google' | 'github',
    options: {
      redirectTo: url.origin + "/api/auth/callback",
    },
  });

  if (error) return new Response(error.message, { status: 500 });
  return redirect(data.url);
};