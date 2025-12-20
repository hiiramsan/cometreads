import { defineCollection, z } from "astro:content"

const books = defineCollection({
    type: "content",
    schema: z.object({
        title: z.string(),
        author: z.string(),
        img: z.string(),
        pages: z.number().min(1),
        description: z.string(),
        buy: z.object({
            mexico: z.string().optional(),
            usa: z.string().optional(),
        }),
    })
})

export const collections = { books };