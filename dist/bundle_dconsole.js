'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function dconsolePlugin(context) {
    return {
        libraries: () => {
            return context.callNative("dconsolePlugin", "libraries");
        },
        nativePlugins: () => {
            return context.callNative("dconsolePlugin", "nativePlugins");
        },
        viewNodes: () => {
            return context.callNative("dconsolePlugin", "viewNodes");
        },
    };
}

exports.dconsolePlugin = dconsolePlugin;
//# sourceMappingURL=bundle_dconsole.js.map
