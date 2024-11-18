import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter, useSegments } from 'expo-router';
import { useQuery, useRealm } from '@realm/react';
import { Subject } from '../store';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const segments = useSegments();
  const router = useRouter();
  
  const subject: any = useQuery('Subject')[0]
  const isSignedIn = subject?.isSignedIn === true

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';

    // for some reason, something like if "(inAuthGroup && isSignedIn)"
      // does not work, and it keeps on sending me to the "Not-Found screen"
      // this is a workaroung for that
      // it may not look clean, but it works
      // if(segments[0] === '+not-found'){
      //   router.replace('/(app)/home');
      // }

    if (!inAuthGroup && !isSignedIn) {
      router.replace('/(auth)/login');
    } else if (!inAuthGroup && isSignedIn) {
      // for some reason, something like if "(inAuthGroup && isSignedIn)"
      // does not work, and it keeps on sending me to the "Not-Found screen"
      // this is a workaroung for that
      // it may not look clean, but it works
      if(segments[0] === '+not-found'){
        router.replace('/(app)/home');
      }
    }

  }, [segments, isSignedIn]);

  return <>{children}</>;
}