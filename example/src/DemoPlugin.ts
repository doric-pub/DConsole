import { BridgeContext } from "doric";

export function demoPlugin(context: BridgeContext) {
    return {
        openDConsole: () => {
            return context.callNative("demoPlugin", "openDConsole") as Promise<void>
        },
        closeDConsole: () => {
            return context.callNative("demoPlugin", "closeDConsole") as Promise<void>
        }
    };
}