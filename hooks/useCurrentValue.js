/**
 * 
 * useCurrentValue / useLatest
 * 
 */

import React from 'react';

export default function useCurrentValue(value) {
  const ref = React.useRef(null);
  ref.current = value;
  return ref;
}
