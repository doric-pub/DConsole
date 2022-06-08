package pub.doric.library;

import android.util.Log;
import com.github.pengfeizhou.jscore.JavaValue;
import org.json.JSONArray;
import java.lang.ref.WeakReference;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import pub.doric.DoricContext;
import pub.doric.DoricLibrary;
import pub.doric.DoricRegistry;
import pub.doric.DoricSingleton;
import pub.doric.extension.bridge.DoricMethod;
import pub.doric.extension.bridge.DoricPlugin;
import pub.doric.extension.bridge.DoricPromise;
import pub.doric.plugin.DoricJavaPlugin;
import pub.doric.shader.ViewNode;
import pub.doric.utils.DoricMetaInfo;

@DoricPlugin(name = "dconsolePlugin")
public class DConsolePlugin extends DoricJavaPlugin {

    public DConsolePlugin(DoricContext doricContext) {
        super(doricContext);
    }

    @DoricMethod
    public void libraries(DoricPromise promise) {
        List<String> librariesList = new ArrayList<>();

        for (DoricLibrary library : DoricSingleton.getInstance().libraries) {
            if (library != null) {
                Log.d("wushangkun", "getSimpleName library: " + library.getClass().getSimpleName());
                Log.d("wushangkun", "getName library: " + library.getClass().getName());
                Log.d("wushangkun", "getCanonicalName library: " + library.getClass().getCanonicalName());
                librariesList.add(library.getClass().getCanonicalName());
            }
        }
        JSONArray jsonArray = new JSONArray(librariesList);
        promise.resolve(new JavaValue(jsonArray));
    }

    @DoricMethod
    public void nativePlugins(DoricPromise promise) {
        List<String> pluginsList = new ArrayList<>();
        for (WeakReference<DoricRegistry> registryWeakReference : DoricSingleton.getInstance().registries) {
            DoricRegistry registry = registryWeakReference.get();
            if (registry != null) {
                Set<String> pluginsSet = registry.allPlugins();
                if (pluginsSet != null) {
                    for (String key : pluginsSet) {
                        DoricMetaInfo<DoricJavaPlugin> pluginInfo = registry.acquirePluginInfo(key);
                        if (pluginInfo != null) {
                            String formatStr = String.format("%s = %s", key, pluginInfo.getName());
                            Log.d("wushangkun", "plugin "+formatStr);
                            pluginsList.add(formatStr);
                        }
                    }
                }
            }
        }
        JSONArray jsonArray = new JSONArray(pluginsList);
        promise.resolve(new JavaValue(jsonArray));
    }

    @DoricMethod
    public void viewNodes(DoricPromise promise) {
        List<String> nodesList = new ArrayList<>();
        for (WeakReference<DoricRegistry> registryWeakReference : DoricSingleton.getInstance().registries) {
            DoricRegistry registry = registryWeakReference.get();
            if (registry != null) {
                Set<String> nodesSet = registry.allViewNodes();
                if (nodesSet != null) {
                    for (String key : nodesSet) {
                        DoricMetaInfo<ViewNode<?>> nodeInfo = registry.acquireViewNodeInfo(key);
                        if (nodeInfo != null) {
                            String formatStr = String.format("%s = %s", key, nodeInfo.getName());
                            Log.d("wushangkun", "node "+formatStr);
                            nodesList.add(formatStr);
                        }
                    }
                }
            }
        }
        JSONArray jsonArray = new JSONArray(nodesList);
        promise.resolve(new JavaValue(jsonArray));
    }
}
