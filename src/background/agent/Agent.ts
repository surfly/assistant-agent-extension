import { TResponseSchema, ResponseSchema } from "./schema.ts";
import { OpenAIAdapter } from "./LLMAdapter.ts";

import SYSTEM_PROMPT from "../SYSTEM_PROMPT.md";

export class Agent {
    private readonly apiAdapter: OpenAIAdapter;

    constructor(apiAdapter: OpenAIAdapter) {
        this.apiAdapter = apiAdapter;
    }

    public async consult(snapshot, question): Promise<TResponseSchema> {
        const analysis: TResponseSchema = await this.apiAdapter
            .request<TResponseSchema>(
                SYSTEM_PROMPT,
                [
                    snapshot,
                    question
                ],
                ResponseSchema
            );

        return analysis;
    }
}
