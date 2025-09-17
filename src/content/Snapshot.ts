/**
 * Snapshot class serialize content tab runtime UI state.
 */

abstract class Snapshot<T> {
    public abstract take(): Promise<T>;
}

export type TSnapshot = typeof Snapshot;

export class DOMSnapshot extends Snapshot<string> {
    public async take(): Promise<string> {
        const snapshot = await browser.webfuseSession
            .automation
            .take_dom_snapshot({
                modifier: 'downsample'
            });

        return snapshot;
    }
}