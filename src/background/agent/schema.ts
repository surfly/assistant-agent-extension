import { z } from "zod";

const InteractionPromptSchema = z.object({
    action: z.enum([
        "click"
    ]),
    selector: z.string(),
    message: z.string()
});

export const ResponseSchema = z.object({
    assistance: z.string(),
    interactionPrompt: z.object({
    ...InteractionPromptSchema.shape
    })
        .optional()
        .nullable()
});

export type TResponseSchema = z.infer<typeof ResponseSchema>;