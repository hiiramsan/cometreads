// src/pages/api/books/search.ts
import type { APIRoute } from 'astro'

export const GET: APIRoute = async ({ url }) => {
  const q = url.searchParams.get('q')
  if (!q) return new Response(JSON.stringify([]), { status: 200 })

  const response = await fetch(
    `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=6&fields=key,title,author_name,number_of_pages_median,cover_i`
  )

  if (!response.ok) {
    return new Response(JSON.stringify({ error: 'Failed to fetch' }), { status: 502 })
  }

  const data = await response.json()

  const items = (data.docs ?? []).map((doc: any) => ({
    id: doc.key,
    title: doc.title ?? '',
    authors: doc.author_name ?? [],
    pageCount: doc.number_of_pages_median ?? null,
    coverUrl: doc.cover_i
      ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
      : null,
  }))

  return new Response(JSON.stringify(items), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}