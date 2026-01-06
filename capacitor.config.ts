import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'audio-transcription',
  webDir: 'www',
  server: {
    androidScheme: 'http',    // <--- C'EST LA LIGNE IMPORTANTE !
    cleartext: true,          // Autorise le trafic non chiffré
    allowNavigation: [
      '192.168.1.6'           // Autorise explicitement ton IP
    ]
  }
};

export default config;
