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

        const payload = {
            title: formData.get("title"),
            user_id: user.id,
            author: formData.get("author"),
            cover_url: formData.get("img"),
            pages: formData.get("pages") ? parseInt(formData.get("pages") as string) : 0,
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