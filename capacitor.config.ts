import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.8fffdd8691e94fed9e5c4e1b2fa54fef',
  appName: 'eco-trace-warehouse-flow',
  webDir: 'dist',
  server: {
    url: 'https://8fffdd86-91e9-4fed-9e5c-4e1b2fa54fef.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Camera: {
      permissions: [
        'camera',
        'photos'
      ]
    }
  }
};

export default config;