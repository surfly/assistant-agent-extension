import { DOMSnapshot } from "./Snapshot";

function updateAugmentation(message) {
    window.AUGMENTATION
        .querySelector("p")
        .textContent = message;
}

document.addEventListener("DOMContentLoaded", async () => {
    const domSnapshot: DOMSnapshot = new DOMSnapshot();

    browser.runtime
        .sendMessage({
            target: "background",
            cmd: "agency-request",
            data: {
                snapshot: await domSnapshot.take()
            }
        });
});

browser.runtime.onMessage
    .addListener(async message => {
        if(message.target !== "content") return;

        switch(message.cmd) {
            case "agency-response": {
                updateAugmentation(message.data?.contentDescription);

                break;
            }
        }
    });