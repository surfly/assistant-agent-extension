/**
 * LLM API adapters class for agentic communicattion.
 * An LLM represents the agentic backend, i.e., it answers certain 'questions'.
 * Example: How to interact with a website, given a task and a snapshot (serialized UI state)?
 */

import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { ZodType } from "zod";

import { TInput } from "#shared/types.ts";
import { log } from "#shared/util.ts";


abstract class LLMAdapter {
    public abstract request<T = string>(
        systemPrompt: string | string[],
        input: TInput | TInput[],
        responseSchema?: ZodType
    ): Promise<T>
}

export type TLLMAdapter = typeof LLMAdapter;

export class OpenAIAdapter extends LLMAdapter {
    private readonly model;
    private readonly endpoint;

    constructor(model, key) {
        super();

        this.model = model;
        this.endpoint = new OpenAI({
            apiKey: key
        });
    }

    private async createFile(bitmap: ImageBitmap) {
        const result = await this.endpoint.files
            .create({
                file: bitmap,
                purpose: "vision",
            });

        return result.id;
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
                        .filter(inputItem => {
                            try {
                                return typeof(inputItem) === "string"
                                    || Object.hasOwn((inputItem as object), "bitmap");
                            } catch {
                                return false;
                            }
                        })
                        .map(async inputItem => {
                            return typeof(inputItem) === "string"
                                ? { type: "input_text", text: inputItem as string }
                                : { type: "input_image", file_id: await this.createFile(inputItem as ImageBitmap) };
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