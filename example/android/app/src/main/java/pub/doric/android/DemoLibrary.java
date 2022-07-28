package pub.doric.android;

import pub.doric.DoricComponent;
import pub.doric.DoricLibrary;
import pub.doric.DoricRegistry;

@DoricComponent
public class DemoLibrary extends DoricLibrary {

    @Override
    public void load(DoricRegistry registry) {
        registry.registerNativePlugin(DemoPlugin.class);
    }
}