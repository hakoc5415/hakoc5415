package com.vikingraid.ro;

import android.graphics.Color;
import android.os.Bundle;
import androidx.activity.EdgeToEdge;
import androidx.activity.SystemBarStyle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Android 15+ shows apps edge-to-edge by default; enable it explicitly
        // on every version (Google Play guidance) with transparent bars and
        // light icons. The game draws its own dark full-screen scene and its
        // HUD already respects CSS safe-area insets, so nothing gets covered.
        EdgeToEdge.enable(
            this,
            SystemBarStyle.dark(Color.TRANSPARENT),
            SystemBarStyle.dark(Color.TRANSPARENT)
        );
        super.onCreate(savedInstanceState);
    }
}
