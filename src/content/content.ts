import { DOMSnapshot } from "./Snapshot";

type TStage = "1" | "2" | "3" | "4" | "5";

const SpeechRecognition = (window.SpeechRecognition || window.webkitSpeechRecognition);

let snapshot;
let thinkTimeout;
document.addEventListener("DOMContentLoaded", async () => {
    const link = document.createElement("LINK");

    link.setAttribute("rel", "stylesheet");
    link.setAttribute("href", "https://fonts.googleapis.com/css2?family=Rethink+Sans:ital,wght@0,400..800;1,400..800&display=swap");

    document.head.appendChild(link);

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
    let node: Node | null = walker.firstChild();
    let i = 0;
    while(node) {
        const currentNode = (node as HTMLElement);
        node = walker.nextNode();

        if (![
            "A", "BUTTON", "INPUT", "TEXTAREA"
        ].includes(currentNode.tagName.toUpperCase())) continue;

        currentNode.setAttribute("data-uid", (i++).toString());
    }

    snapshot = new DOMSnapshot().take();

    !SpeechRecognition
        && window.toggleInputMeans();

    setTimeout(() => window.reset(), 2000);
});

async function consultAgent(question: string) {
    question = question.trim();
    if(!question.length) return false;

    await feedbackAugmentation(
        "2",
        `${question.charAt(0).toUpperCase()}${question.slice(1).replace(/([^.!?:;])$/, "$1?")}`
    );

    thinkTimeout = setTimeout(async () => {
        await feedbackAugmentation("3", "Let me analyze this page for you...");
    }, 3000);

    browser.runtime
        .sendMessage({
            target: "background",
            cmd: "agency-request",
            data: {
                snapshot: await snapshot,
                question
            }
        });

    return true;
}

async function feedbackAugmentation(stage: TStage, text, keepCurrent = false) {
    const feedbackElement = window.AUGMENTATION
        .querySelector(`section#stage-${stage} #feedback`);
    feedbackElement.textContent = "";

    !keepCurrent
        && Array.from(
            window.AUGMENTATION.querySelectorAll("section.active")
        ).forEach(section => {
            section
                ?.classList
                .remove("active");
        });
    window.AUGMENTATION
        .querySelector(`section#stage-${stage}`)
        .classList
        .add("active");

    await new Promise(resolve => setTimeout(resolve, 200));

    return new Promise(resolve => {
        const mt = (4 / (Math.log(text.length) + 1)) * 20;
        const setText = (index) => {
            if(index > text.length) return resolve(true);

            feedbackElement.textContent = text.slice(0, index);

            setTimeout(() => setText(index + 1), mt + Math.random() * mt);
        };

        setText(0);
    });
}

let recognition;
let isRecording = false;
let recordTimeout;
window.toggleRecord = async function() {
    clearTimeout(recordTimeout);

    window.AUGMENTATION
        .querySelector("#audio")
        .classList
        .toggle("active");

    isRecording = !isRecording;

    if(!isRecording) {
        recognition.stop();

        return;
    }

    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = async e => {
        const transcript = Array.from(e.results)
            .map(result => result[0].transcript)
            .join("");

        consultAgent(transcript);
    };

    recognition.start();

    recordTimeout = setTimeout(() => window.toggleRecord(), 10000);
}

window.submitText = function() {
    const text = window.AUGMENTATION
        .querySelector("#text")
        .value;

    if(consultAgent(text)) {
        setTimeout(() => {
            window.AUGMENTATION
                .querySelector("#text")
                .value = "";
        });
    }
}

window.toggleInputMeans = function() {
    window.AUGMENTATION
        .querySelector("#input-audio")
        ?.classList
        .toggle("active");
    window.AUGMENTATION
        .querySelector("#input-text")
        ?.classList
        .toggle("active");
}

window.reset = function() {
    return feedbackAugmentation("1", "Do you need help on this page?");
}

let pendingInteraction;
window.performPendingInteraction = async function() {
    if(!pendingInteraction) return;

    window.AUGMENTATION
        .querySelector("section#stage-5")
        .classList
        .remove("active");

    try {
        switch(pendingInteraction.action) {
            case "click":
                await browser.webfuseSession.automation.left_click(pendingInteraction.selector);

                break;
        }
    } catch(err) {
        console.error(err);

        feedbackAugmentation("4", "Sorry, I cannot help you right now. Please try again.");
    }
}

browser.runtime.onMessage
    .addListener(async message => {
        if(message.target !== "content") return;

        switch(message.cmd) {
            case "agency-response": {
                clearTimeout(thinkTimeout);

                await feedbackAugmentation("4", message.data?.assistance);

                pendingInteraction = message.data?.interactionPrompt;
                pendingInteraction
                    && setTimeout(() => {
                        if(!document.querySelector(pendingInteraction.selector)) return;

                        feedbackAugmentation("5", pendingInteraction.message, true);
                    }, 500);

                break;
            }
        }
    });