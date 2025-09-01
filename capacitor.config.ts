
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kounfit.app',
  appName: 'Kounfit',
  webDir: 'out',
  server: {
    hostname: 'fithelath.web.app',
    androidScheme: 'https',
    iosScheme: 'https'
  },
  plugins: {
    CapacitorFirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ["google.com", "apple.com"],
    },
  },
};

export default config;
