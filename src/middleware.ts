import { defineMiddleware } from "astro:middleware";
import { supabase } from "./lib/supabase";

export const onRequest = defineMiddleware(async (context, next) => {
  const protectedPaths = ["/books", "/timeline", "/upload", "profile"];
  const isProtected = protectedPaths.some(path => context.url.pathname.startsWith(path));

  const accessToken = context.cookies.get("sb-access-token");
  const refreshToken = context.cookies.get("sb-refresh-token");

  if (isProtected && !accessToken) {
    return context.redirect("/login");
  }

  if (accessToken && refreshToken) {
    const { data, error } = await supabase.auth.getUser(accessToken.value);

    if (error || !data.user) {
      context.cookies.delete("sb-access-token", { path: "/" });
      context.cookies.delete("sb-refresh-token", { path: "/" });
      if (isProtected) return context.redirect("/login");
    } else {
      context.locals.user = data.user;
    }
  }

  return next();
});