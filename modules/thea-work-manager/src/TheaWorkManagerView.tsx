import { requireNativeViewManager } from 'expo-modules-core';
import * as React from 'react';

import { TheaWorkManagerViewProps } from './TheaWorkManager.types';

const NativeView: React.ComponentType<TheaWorkManagerViewProps> =
  requireNativeViewManager('TheaWorkManager');

export default function TheaWorkManagerView(props: TheaWorkManagerViewProps) {
  return <NativeView {...props} />;
}
