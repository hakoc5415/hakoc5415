package com.vikingraid.ro;

import android.app.ActivityManager;
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

    // Render-scale for weak devices (<= 6 GB RAM): the WebView is laid out
    // ~20% smaller and GPU-upscaled to fill the screen. The game is fully
    // responsive (it already runs on 320-450px-wide viewports), so the layout
    // stays correct — but ~36% fewer pixels are rasterized and composited
    // every frame, which is the difference between ~40fps and ~60fps on
    // fill-rate-bound GPUs like the Galaxy A50's. Flagships keep full res.
    private static final float PERF_SCALE = 1.25f;
    private boolean perfScaleApplied = false;
    private boolean weakDevice = false;

    private void applyPerfScale() {
        if (perfScaleApplied || !weakDevice) return;
        if (bridge == null || bridge.getWebView() == null) return;
        View wv = bridge.getWebView();
        View parent = (View) wv.getParent();
        if (parent == null || parent.getWidth() == 0 || parent.getHeight() == 0) return;
        int w = Math.round(parent.getWidth() / PERF_SCALE);
        int h = Math.round(parent.getHeight() / PERF_SCALE);
        ViewGroup.LayoutParams lp = wv.getLayoutParams();
        lp.width = w;
        lp.height = h;
        wv.setLayoutParams(lp);
        wv.setPivotX(0f);
        wv.setPivotY(0f);
        wv.setScaleX(PERF_SCALE);
        wv.setScaleY(PERF_SCALE);
        perfScaleApplied = true;
    }

    // Strip any padding/margins something (e.g. Capacitor's SystemBars insets
    // code) applies between the WebView and the window edges — the game draws
    // its own dark background and manages safe areas in CSS. Keyboard inset is
    // kept so text inputs stay visible.
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
        // NOTE: EdgeToEdge.enable must run AFTER super.onCreate here — calling
        // it earlier forces the window decor to be created under the manifest
        // theme, and BridgeActivity's later NoActionBar setTheme() can no
        // longer remove the action bar: an ugly "RO! Viking Raid" title bar
        // appeared on some devices.
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(
            this,
            SystemBarStyle.dark(Color.TRANSPARENT),
            SystemBarStyle.dark(Color.TRANSPARENT)
        );
        if (getSupportActionBar() != null) getSupportActionBar().hide();

        try {
            ActivityManager am = (ActivityManager) getSystemService(ACTIVITY_SERVICE);
            ActivityManager.MemoryInfo mi = new ActivityManager.MemoryInfo();
            am.getMemoryInfo(mi);
            weakDevice = mi.totalMem <= 6L * 1024L * 1024L * 1024L;
        } catch (Exception ignored) {}

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
                    applyPerfScale();
                }
            }
        );
    }
}
