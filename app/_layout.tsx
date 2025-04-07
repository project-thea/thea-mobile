import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import { RealmService } from '@/store';
import { StrictMode, useEffect, useRef, useState } from 'react';

import { useColorScheme } from '@/hooks/useColorScheme';
import AuthGuard from '@/components/AuthGuard';
import { RealmProvider } from '@realm/react';
import { deregisterTask, registerTask } from '@/modules/thea-work-manager';
import { API_BASE_URL } from '@/services/api';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const BG_SYNC_INTERVAL = 15 * 60 * 1000 // 15 minutes

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const realmInitDone = useRef(false);
  const [forceRenderOnRealmInit, setForceRenderOnRealmInit] = useState(false);

  const realmInit = () => {
    if(RealmService.isMigrationNeeded()){
      deregisterTask('locations_background_sync')
      RealmService.migrate()
    }

    registerTask('locations_background_sync', BG_SYNC_INTERVAL,  RealmService.CURR_SCHEMA_VERSION, API_BASE_URL);

  }

  useEffect(() => {
    if(!realmInitDone.current){
      realmInit()
    }
    
    realmInitDone.current = true;
    setForceRenderOnRealmInit(!forceRenderOnRealmInit);
  }, []);

  return (
    <StrictMode>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        {
          realmInitDone.current && (
            <RealmProvider realm={RealmService.getInstance()} >
                <AuthGuard>
                  <Stack screenOptions={{headerShown: false}}></Stack>
                  <Toast />
                </AuthGuard>
            </RealmProvider>
          )
        }
      </ThemeProvider>
    </StrictMode>
  );
}
