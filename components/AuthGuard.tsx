import React, { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useQuery, useRealm } from '@realm/react';
import { RealmService } from '@/store';

const doOnAppStartUp = () => {
  if(RealmService.isMigrationNeeded()){
    RealmService.migrate()
  }
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const segments = useSegments();
  const router = useRouter();
  
  const subject: any = useQuery('Subject')[0]
  const isSignedIn = subject?.isSignedIn === true

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';

    if (!inAuthGroup && !isSignedIn) {
      // trying to access routes outside of the auth group
      router.replace('/login');
    } else if (!inAuthGroup && isSignedIn) {
        router.replace('/home');
    }

  }, [segments, isSignedIn]);

  useEffect(() => {
    doOnAppStartUp()
  }, []);

  return <>{children}</>;
}