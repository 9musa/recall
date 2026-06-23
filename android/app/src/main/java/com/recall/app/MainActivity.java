package com.recall.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import androidx.core.splashscreen.SplashScreen;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // 2. Initialize the splash screen BEFORE calling super.onCreate
        SplashScreen.installSplashScreen(this);

        super.onCreate(savedInstanceState);
    }
}
