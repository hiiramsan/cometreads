// src/pages/api/auth/callback.ts
import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

const ONE_MONTH = 60 * 60 * 24 * 30;

export const GET: APIRoute = async ({ url, cookies, redirect }) => {
  const authCode = url.searchParams.get("code");

  

  if (!authCode) {
    return redirect("/login?error=no_code");
  }

  const { data, error } = await supabase.auth.exchangeCodeForSession(authCode);

  if (error) {
    return redirect("/login?error=" + error.message); 
  }

  const { access_token, refresh_token } = data.session;

  const cookieOptions = {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "lax" as const, 
    maxAge: ONE_MONTH,
  };

  cookies.set("sb-access-token", access_token, { path: "/", httpOnly: true, secure: true });
  cookies.set("sb-refresh-token", refresh_token, { path: "/", httpOnly: true, secure: true });

  return redirect("/books"); 
};