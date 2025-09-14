import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'go.green.customer',
  appName: 'Go Green',
  webDir: 'www',
  plugins: {
    Keyboard: {
      resize: "none",   // prevents UI from shifting when keyboard opens
      style: "light",   // optional: light or dark keyboard appearance
      resizeOnFullScreen: false // recommended for Android
    }
  }
};

export default config;