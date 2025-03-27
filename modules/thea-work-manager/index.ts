import { NativeModulesProxy, EventEmitter, Subscription } from 'expo-modules-core';

// Import the native module. On web, it will be resolved to TheaWorkManager.web.ts
// and on native platforms to TheaWorkManager.ts
import TheaWorkManagerModule from './src/TheaWorkManagerModule';
import TheaWorkManagerView from './src/TheaWorkManagerView';
import { ChangeEventPayload, TheaWorkManagerViewProps } from './src/TheaWorkManager.types';

const tasksAndCallbacks = new Map();

const emitter = new EventEmitter(TheaWorkManagerModule ?? NativeModulesProxy.TheaWorkManager);

export function registerTask(taskName: string, interval: number, callback: Function) {
  const eventName = "locations_background_sync_start"

  TheaWorkManagerModule.registerTask(taskName, interval);

  if (!tasksAndCallbacks.has(taskName)) {
    tasksAndCallbacks.set(taskName, callback);
    addListener(eventName, callback);
  }
}

export function deregisterTask(taskName: string) {
  TheaWorkManagerModule.deregisterTask(taskName);
  tasksAndCallbacks.delete(taskName);
}

async function setValueAsync(value: string) {
  return await TheaWorkManagerModule.setValueAsync(value);
}

function addListener(eventName: string, listener: any) {
  return emitter.addListener(eventName, listener);
}

export { TheaWorkManagerView, TheaWorkManagerViewProps, ChangeEventPayload };
