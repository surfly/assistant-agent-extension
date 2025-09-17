/**
 * Agent class that mediates between the user and an LLM.
 * The agent is 'consulted' as a agentic backend.
 */

import { TInput } from "#shared/types.ts";
import { TResponseSchema, ResponseSchema } from "./schema.ts";
import { OpenAIAdapter } from "./LLMAdapter.ts";

import SYSTEM_PROMPT from "../SYSTEM_PROMPT.md";

export class Agent {
    private readonly apiAdapter: OpenAIAdapter;

    constructor(apiAdapter: OpenAIAdapter) {
        this.apiAdapter = apiAdapter;
    }

    public async consult(input: TInput | TInput[]): Promise<string> {
        const analysis: TResponseSchema = await this.apiAdapter
            .request<TResponseSchema>(
                SYSTEM_PROMPT,
                input,
                ResponseSchema
            );

        return analysis.contentDescription;
    }
}
