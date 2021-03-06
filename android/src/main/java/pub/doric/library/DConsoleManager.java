package pub.doric.library;
import android.content.Intent;
import androidx.localbroadcastmanager.content.LocalBroadcastManager;
import pub.doric.Doric;

public class DConsoleManager {

    public boolean enable = true;

    private static class Inner {
        private static final DConsoleManager sInstance = new DConsoleManager();
    }

    private DConsoleManager() {
    }

    public static DConsoleManager getInstance() {
        return DConsoleManager.Inner.sInstance;
    }

    public void enableConsole(boolean enable) {
        if (this.enable != enable) {
            this.enable = enable;
            Intent intent = new Intent("dConsoleEnableStateNotiName");
            intent.putExtra("isEnable", enable);
            LocalBroadcastManager.getInstance(Doric.application()).sendBroadcast(intent);
        }
    }
}

