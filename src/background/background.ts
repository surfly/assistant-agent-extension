import { readEnv } from "#shared/util.ts";
import { TResponseSchema } from "./agent/schema.ts";
import { Agent } from "./agent/Agent.ts";
import { OpenAIAdapter } from "./agent/LLMAdapter.ts";

const agent = new Agent(
    new OpenAIAdapter(
        readEnv("MODEL_NAME").string || "gpt-4.1",
        readEnv("OPENAI_API_KEY").string
    )
);

async function getCurrentTab(): Promise<number> {
    try {
        const [ tab ] = await browser.tabs.query({
            active: true,
            lastFocusedWindow: true
        });
        return tab.index ?? 0;
    } catch {
        return 0;
    }
};

browser.runtime.onMessage
    .addListener(async message => {
        if(message.target !== "background") return;

        switch(message.cmd) {
            case "agency-request": {
                try {
                    const data: TResponseSchema = await agent.consult(
                        message.data?.snapshot,
                        message.data?.question
                    );

                    browser.tabs
                        .sendMessage(await getCurrentTab(), {
                            target: "content",
                            cmd: "agency-response",
                            data
                        });
                } catch(err) {
                    console.error(err);

                    return;
                }

                break;
            }
        }
    });