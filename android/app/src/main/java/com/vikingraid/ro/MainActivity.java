package com.vikingraid.ro;

import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewParent;
import android.view.ViewTreeObserver;
import androidx.activity.EdgeToEdge;
import androidx.activity.SystemBarStyle;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    // The game is a fullscreen canvas that manages its own safe areas in CSS.
    // Depending on the Capacitor version, its SystemBars code pads the WebView
    // (or one of its ancestors) with system-bar insets on Android 15+, which
    // paints ugly bands above/below the game. enforceFullscreen() runs on
    // EVERY layout pass and strips any padding/margin from the WebView up to
    // the window root — whatever adds it, it is gone on the next frame. Only
    // the keyboard inset is kept so text inputs stay visible.
    private void enforceFullscreen() {
        if (bridge == null || bridge.getWebView() == null) return;
        int imeBottom = 0;
        try {
            WindowInsetsCompat ins = ViewCompat.getRootWindowInsets(bridge.getWebView());
            if (ins != null && ins.isVisible(WindowInsetsCompat.Type.ime())) {
                imeBottom = ins.getInsets(WindowInsetsCompat.Type.ime()).bottom;
            }
        } catch (Exception ignored) {}
        View v = bridge.getWebView();
        boolean first = true;
        while (v != null) {
            int wantBottom = first ? imeBottom : 0;
            if (v.getPaddingLeft() != 0 || v.getPaddingTop() != 0 || v.getPaddingRight() != 0 || v.getPaddingBottom() != wantBottom) {
                v.setPadding(0, 0, 0, wantBottom);
            }
            ViewGroup.LayoutParams lp = v.getLayoutParams();
            if (lp instanceof ViewGroup.MarginLayoutParams) {
                ViewGroup.MarginLayoutParams mlp = (ViewGroup.MarginLayoutParams) lp;
                if (mlp.leftMargin != 0 || mlp.topMargin != 0 || mlp.rightMargin != 0 || mlp.bottomMargin != 0) {
                    mlp.setMargins(0, 0, 0, 0);
                    v.setLayoutParams(mlp);
                }
            }
            first = false;
            ViewParent p = v.getParent();
            v = (p instanceof View) ? (View) p : null;
        }
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        EdgeToEdge.enable(
            this,
            SystemBarStyle.dark(Color.TRANSPARENT),
            SystemBarStyle.dark(Color.TRANSPARENT)
        );
        super.onCreate(savedInstanceState);

        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        WindowInsetsControllerCompat wic =
            new WindowInsetsControllerCompat(getWindow(), getWindow().getDecorView());
        wic.setAppearanceLightStatusBars(false);
        wic.setAppearanceLightNavigationBars(false);

        enforceFullscreen();
        getWindow().getDecorView().getViewTreeObserver().addOnGlobalLayoutListener(
            new ViewTreeObserver.OnGlobalLayoutListener() {
                @Override
                public void onGlobalLayout() {
                    enforceFullscreen();
                }
            }
        );
    }
}
