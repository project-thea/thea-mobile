import { requireNativeModule, EventEmitter, Subscription } from 'expo-modules-core';

import TheaWorkManagerModule from './src/TheaWorkManagerModule';
import TheaWorkManagerView from './src/TheaWorkManagerView';
import { ChangeEventPayload, TheaWorkManagerViewProps } from './src/TheaWorkManager.types';
import { RealmService } from '@/store';

const TheaWorkManager = requireNativeModule('TheaWorkManager');

export function registerTask(taskName: string, interval: number, schemaVersion: number, baseUrl: string) {
  TheaWorkManagerModule.registerTask(taskName, interval, schemaVersion, baseUrl);
}

export function deregisterTask(taskName: string) {
  TheaWorkManagerModule.deregisterTask(taskName);
}

export function helloWorld() {
  return TheaWorkManagerModule.helloWorld();
}

export function syncLocations(){
  return TheaWorkManagerModule.syncLocations();
}

async function setValueAsync(value: string) {
  return await TheaWorkManagerModule.setValueAsync(value);
}

export { TheaWorkManagerView, TheaWorkManagerViewProps, ChangeEventPayload };
