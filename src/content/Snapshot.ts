abstract class Snapshot<T> {
    public abstract take(): Promise<T>;
}

export type TSnapshot = typeof Snapshot;

export class DOMSnapshot extends Snapshot<string> {
    public async take(): Promise<string> {
        const snapshot = await browser.webfuseSession
            .automation
            .take_dom_snapshot({
                rootSelector: "body",
                modifier: {
                    name: "AdaptiveD2Snap",
                    params: {
                        maxTokens: 2**15,
                        maxIterations: 2
                    }
                }
            });

        return snapshot;
    }
}