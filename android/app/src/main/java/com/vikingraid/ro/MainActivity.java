package com.vikingraid.ro;

import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import androidx.activity.EdgeToEdge;
import androidx.activity.SystemBarStyle;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        EdgeToEdge.enable(
            this,
            SystemBarStyle.dark(Color.TRANSPARENT),
            SystemBarStyle.dark(Color.TRANSPARENT)
        );
        super.onCreate(savedInstanceState);

        // The game is a fullscreen canvas that manages its own safe areas in
        // CSS. Capacitor's SystemBars code (present in some 8.x versions) pads
        // the WebView with system-bar insets on Android 15+, painting ugly
        // bands above/below the game. Replacing the insets listener on the
        // WebView's parent makes that padding impossible on every Capacitor
        // version; only the keyboard still pads the bottom so inputs stay
        // visible.
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        if (this.bridge != null && this.bridge.getWebView() != null) {
            final View parent = (View) this.bridge.getWebView().getParent();
            if (parent != null) {
                ViewCompat.setOnApplyWindowInsetsListener(parent, (v, insets) -> {
                    Insets ime = insets.getInsets(WindowInsetsCompat.Type.ime());
                    boolean imeVisible = insets.isVisible(WindowInsetsCompat.Type.ime());
                    v.setPadding(0, 0, 0, imeVisible ? ime.bottom : 0);
                    return insets;
                });
                parent.setPadding(0, 0, 0, 0);
                ViewCompat.requestApplyInsets(parent);
            }
        }
        WindowInsetsControllerCompat wic =
            new WindowInsetsControllerCompat(getWindow(), getWindow().getDecorView());
        wic.setAppearanceLightStatusBars(false);
        wic.setAppearanceLightNavigationBars(false);
    }
}
