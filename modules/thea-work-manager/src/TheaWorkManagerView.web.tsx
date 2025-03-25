import * as React from 'react';

import { TheaWorkManagerViewProps } from './TheaWorkManager.types';

export default function TheaWorkManagerView(props: TheaWorkManagerViewProps) {
  return (
    <div>
      <span>{props.name}</span>
    </div>
  );
}
