import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.urbanexplorer',
  appName: 'Urban Explorer',
  webDir: 'www',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    hostname: 'urbanexplorer.app'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#3880ff'
    },
    App: {
      // Enable deep linking
      appUrlOpen: true
    }
  }
};

export default config;
