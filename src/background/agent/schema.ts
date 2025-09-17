/**
 * LLM response schema to enforce consistent, uniformously parsable responses.
 */

import { ZodType, z } from "zod";

export const ResponseSchema = z.object({
    contentDescription: z.string()
});

export type TResponseSchema = z.infer<typeof ResponseSchema>;