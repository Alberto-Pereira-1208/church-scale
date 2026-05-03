import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.igrejascala.app',
  appName: 'Escala Igreja',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https',
    cleartext: true,
    url: 'http://localhost:8100',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#488AFF',
    },
  },
};

export default config;

