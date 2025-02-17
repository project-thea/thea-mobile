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

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const realmInitDone = useRef(false);
  const [forceRenderOnRealmInit, setForceRenderOnRealmInit] = useState(false);

  const realmInit = () => {
    if(RealmService.isMigrationNeeded()){
      RealmService.migrate()
    }
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
