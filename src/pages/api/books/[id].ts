import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

// Helper to get user
const getUser = async (cookies: any) => {
  const accessToken = cookies.get('sb-access-token');
  const refreshToken = cookies.get('sb-refresh-token');

  if (!accessToken || !refreshToken) return null;

  const { data: { user }, error } = await supabase.auth.getUser(accessToken.value);
  if (error || !user) return null;
  return user;
};

export const POST: APIRoute = async ({ params, cookies, request, redirect }) => {
  const user = await getUser(cookies);
  if (!user) return redirect("/login");

  const formData = await request.formData();
  const id = params.id;

  const payload: any = {};

  // Only add fields if they exist in the form data
  if (formData.has("title")) payload.title = formData.get("title");
  if (formData.has("author")) payload.author = formData.get("author");
  if (formData.has("pages")) payload.pages = parseInt(formData.get("pages") as string);
  if (formData.has("status")) payload.status = formData.get("status");
  if (formData.has("img")) payload.cover_url = formData.get("img");
  if (formData.has("review")) payload.review = formData.get("review");
  
  if (formData.has("start_date")) {
    const startDate = formData.get("start_date")?.toString();
    payload.start_date = startDate || null;
  }
  
  if (formData.has("end_date")) {
    const endDate = formData.get("end_date")?.toString();
    payload.end_date = endDate || null;
  }

  const { error } = await supabase
    .from("books")
    .update(payload)
    .eq("id", id)
    .eq('user_id', user.id);

  if (error) return new Response(error.message, { status: 500 });

  return redirect(`/books/${id}`);
};

export const DELETE: APIRoute = async ({ params, cookies, redirect }) => {
  const user = await getUser(cookies);
  if (!user) return new Response("Unauthorized", { status: 401 });

  const id = params.id;

  const { error } = await supabase
    .from("books")
    .delete()
    .eq("id", id)
    .eq('user_id', user.id);

  if (error) return new Response(error.message, { status: 500 });

  return redirect("/books");
};