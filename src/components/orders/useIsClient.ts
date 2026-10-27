"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** False during SSR/hydration, true afterwards — lets auth-dependent UI wait for localStorage */
export function useIsClient() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
