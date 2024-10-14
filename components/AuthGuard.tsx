import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter, useSegments } from 'expo-router';
import { RootState } from '../store';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const isSignedIn = useSelector((state: RootState) => state.auth.isSignedIn);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';

    if (!isSignedIn && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isSignedIn && inAuthGroup) {
      router.replace('/(app)/home');
    }
  }, [isSignedIn, segments]);

  return <>{children}</>;
}