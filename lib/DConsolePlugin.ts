import { BridgeContext } from "doric";

export function dconsolePlugin(context: BridgeContext) {
  return {
    libraries: () => {
      return context.callNative("dconsolePlugin", "libraries") as Promise<
        string[]
      >;
    },
    nativePlugins: () => {
      return context.callNative("dconsolePlugin", "nativePlugins") as Promise<
        string[]
      >;
    },
    viewNodes: () => {
      return context.callNative("dconsolePlugin", "viewNodes") as Promise<
        string[]
      >;
    },
    enableState: () => {
      return context.callNative("dconsolePlugin", "enableState") as Promise<boolean>;
    }
  };
}
