import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import { Subject } from '@/store';

import { useColorScheme } from '@/hooks/useColorScheme';
import AuthGuard from '@/components/AuthGuard';
import { RealmProvider } from '@realm/react';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <RealmProvider schema={[Subject]}>
          <AuthGuard>
            <Stack screenOptions={{headerShown: false}}>
              {/* <Stack.Screen name="(app)" /> */}
              {/* <Stack.Screen name="(auth)" /> */}
            </Stack>
            <Toast />
          </AuthGuard>
      </RealmProvider>
    </ThemeProvider>
  );
}
