// src/middleware.ts
import { defineMiddleware } from "astro:middleware";
import { supabase } from "./lib/supabase";

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, redirect, locals } = context;

  const protectedPaths = ["/books", "/profile", "/timeline", "/upload"];
  const authPaths = ["/login", "/register"];
  const isProtected = protectedPaths.some(path => url.pathname.startsWith(path));
  const isAuthPage = authPaths.includes(url.pathname);

  const accessToken = cookies.get("sb-access-token")?.value;
  const refreshToken = cookies.get("sb-refresh-token")?.value;

  if (!accessToken || !refreshToken) {
    locals.user = null;
    if (isProtected) return redirect("/login");
    return next();
  }

  const { data, error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error || !data.user) {
    cookies.delete("sb-access-token", { path: "/" });
    cookies.delete("sb-refresh-token", { path: "/" });
    locals.user = null;
    if (isProtected) return redirect("/login");
    return next();
  }

  locals.user = data.user;

  if (data.session) {
    const { access_token, refresh_token } = data.session;
    const options = {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      secure: true,
      httpOnly: true,
      sameSite: "lax" as const,
    };
    
    cookies.set("sb-access-token", access_token, options);
    cookies.set("sb-refresh-token", refresh_token, options);
  }

  if (isAuthPage && data.user) {
    return redirect("/books");
  }

  return next();
});