import type { APIRoute } from "astro";
import { supabase } from "../../lib/supabase";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
    try {

        // 1. logica del user
        const accessToken = cookies.get("sb-access-token");
        const refreshToken = cookies.get("sb-refresh-token");

        if (!accessToken || !refreshToken) return redirect("/login");

        const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken.value);

        if (authError || !user) return redirect("/login");

        // 2. logica de insertar libro
        const formData = await request.formData();

        const title = formData.get("title")?.toString().trim();
        const author = formData.get("author")?.toString().trim();
        const pagesStr = formData.get("pages")?.toString();
        const pages = pagesStr ? parseInt(pagesStr) : 0;

        if (!title || title.length > 100) {
            return new Response(JSON.stringify({ error: "Title is required and must be less than 100 characters" }), { status: 400 });
        }
        if (!author || author.length > 50) {
            return new Response(JSON.stringify({ error: "Author is required and must be less than 50 characters" }), { status: 400 });
        }
        if (pages < 0) {
             return new Response(JSON.stringify({ error: "Pages cannot be negative" }), { status: 400 });
        }

        const payload = {
            title,
            user_id: user.id,
            author,
            cover_url: formData.get("img"),
            pages,
            review: formData.get("review"),
            start_date: formData.get("startDate") || null,
            end_date: formData.get("endDate") || null,
            status: formData.get("status"),
        };

        const { data, error } = await supabase
            .from("books")
            .insert([payload])
            .select();

        if (error) {
            console.error("Error de Supabase:", error.message);
            console.error("Código de error:", error.code);
            return new Response(JSON.stringify({
                error: error.message,
                details: error.details
            }), { status: 400 });
        }

        return redirect("/books");

    } catch (err) {
        console.error("Error crítico en el servidor:", err);
        return new Response(JSON.stringify({
            error: "Fallo interno",
            message: err instanceof Error ? err.message : String(err)
        }), { status: 500 });
    }
}