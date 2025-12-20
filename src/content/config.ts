import { defineCollection, z } from "astro:content"

const books = defineCollection({
    type: "content",
    schema: z.object({
        title: z.string(),
        author: z.string(),
        img: z.string(),
        pages: z.number().min(1),
        review: z.string(),
        startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: "Invalid date format",
        }),
        endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: "Invalid date format",
        }),
        status: z.enum(["reading", "completed", "plan to read"]),
    })
})

export const collections = { books };