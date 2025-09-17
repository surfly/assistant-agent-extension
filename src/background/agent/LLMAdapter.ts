import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { ZodType } from "zod";

import { TInput } from "#shared/types.ts";
import { log } from "#shared/util.ts";

export type TLLMAdapter = typeof OpenAIAdapter;

export class OpenAIAdapter {
    private readonly model;
    private readonly endpoint;

    constructor(model, key) {
        this.model = model;
        this.endpoint = new OpenAI({
            apiKey: key
        });
    }

    public async request<T>(
        systemPrompt: string | string[],
        input: TInput | TInput[],
        responseSchema?: ZodType
    ): Promise<T> {
        const reqOptions = {
            model: this.model,
            input: [
                {
                    role: "developer",
                    content: [ systemPrompt ]
                        .flat()
                        .map(instruction => {
                            return { type: "input_text", text: instruction };
                        })
                },
                {
                    role: "user",
                    content: await Promise.all([ input ]
                        .flat()
                        .map(async inputItem => {
                            return { type: "input_text", text: inputItem as string };
                        }))
                }
            ],
            ...responseSchema
                ? {
                    text: {
                        format: zodTextFormat(
                            responseSchema as unknown as ZodType,
                            "analysis"
                        )
                    }
                }
                : {},
            store: false
        };

        log("LLM request:");
        log(reqOptions);
        log("...");

        const res = await this.endpoint
            .responses
            .create(reqOptions);

        log("LLM response:");
        log(res);

        if(res.error) throw res.error;

        const resText = res
            .output[0]
            ?.content[0]
            ?.text;

        try {
            return JSON.parse(
                resText
                    .replace(/^```json/, "")
                    .replace(/```$/, "")
                    .trim()
            ) as T;
        } catch {
            return resText;
        }
    }
}