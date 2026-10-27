"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * Official React 18/19 hook to detect client-side mounting without triggering
 * cascading renders or `react-hooks/set-state-in-effect` warnings.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
