import { NativeModulesProxy, EventEmitter, Subscription } from 'expo-modules-core';

// Import the native module. On web, it will be resolved to TheaWorkManager.web.ts
// and on native platforms to TheaWorkManager.ts
import TheaWorkManagerModule from './src/TheaWorkManagerModule';
import TheaWorkManagerView from './src/TheaWorkManagerView';
import { ChangeEventPayload, TheaWorkManagerViewProps } from './src/TheaWorkManager.types';

// Get the native constant value.
export const PI = TheaWorkManagerModule.PI;

export function hello(): string {
  return TheaWorkManagerModule.hello();
}

export async function setValueAsync(value: string) {
  return await TheaWorkManagerModule.setValueAsync(value);
}

const emitter = new EventEmitter(TheaWorkManagerModule ?? NativeModulesProxy.TheaWorkManager);

export function addChangeListener(listener: (event: ChangeEventPayload) => void): Subscription {
  return emitter.addListener<ChangeEventPayload>('onChange', listener);
}

export { TheaWorkManagerView, TheaWorkManagerViewProps, ChangeEventPayload };
