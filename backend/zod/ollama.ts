import { z } from 'zod'

export const createJobSchema = z.object({
    prompt: z.string().min(1).max(10_000),
})
