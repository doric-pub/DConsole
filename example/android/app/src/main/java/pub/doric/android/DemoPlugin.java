package pub.doric.android;
import pub.doric.DoricContext;
import pub.doric.extension.bridge.DoricMethod;
import pub.doric.extension.bridge.DoricPlugin;
import pub.doric.extension.bridge.DoricPromise;
import pub.doric.library.DConsoleManager;
import pub.doric.plugin.DoricJavaPlugin;

@DoricPlugin(name = "demoPlugin")
public class DemoPlugin extends DoricJavaPlugin {
    public DemoPlugin(DoricContext doricContext) {
        super(doricContext);
    }

    @DoricMethod
    public void openDConsole(DoricPromise promise) {
        DConsoleManager.getInstance().enableConsole(true);
        promise.resolve();
    }

    @DoricMethod
    public void closeDConsole(DoricPromise promise) {
        DConsoleManager.getInstance().enableConsole(false);
        promise.resolve();
    }
}
