import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.recall.app',
  appName: 'Recall',
  webDir: 'build',
  plugins: {
    SplashScreen: {
      launchShowDuration: 2500,
      launchAutoHide: true,
      backgroundColor: "#fae3e3",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      useDialog: false
    }
  }
};

export default config;
