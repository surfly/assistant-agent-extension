/**
 * Utiliy functions shared among components.
 * > import ... from "#shared/...".
 */

export function readEnv(name: string): {
    string: string;
    number: number;
    boolean: boolean;
} {
    const value: string = browser.webfuseSession.env[name.toUpperCase()];

    return {
        string: value,
        number: parseFloat(value),
        boolean: value === "true"
    };
}

export function log(message: string | unknown) {
    if(!readEnv("DEBUG_LOGS").boolean) return;

    console.debug(message);
}