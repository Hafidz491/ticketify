'use client';

import { SWRConfig } from 'swr';
import React from 'react';

/**
 * Global JSON fetcher for SWR.
 * All useSWR calls in the app share this fetcher automatically.
 */
export async function fetcher<T = unknown>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error ${res.status}: ${url}`);
  return res.json() as Promise<T>;
}

interface SWRProviderProps {
  children: React.ReactNode;
}

/**
 * Wrap the app in this provider to enable SWR caching globally.
 *
 * Key settings:
 * - dedupingInterval 30 000ms  → multiple components requesting the same key
 *   within 30 seconds share ONE request (prevents duplicate API hits).
 * - refreshInterval 0          → no auto-polling (revalidate on focus/reconnect instead).
 * - revalidateOnFocus true     → refresh when user switches back to the tab.
 * - revalidateOnReconnect true → refresh when network comes back.
 * - keepPreviousData true      → show cached/stale data instantly while fetching.
 */
export default function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        fetcher,
        dedupingInterval: 30_000,   // 30 s — deduplicate same-key requests
        refreshInterval: 0,          // no polling
        revalidateOnFocus: true,     // fresh data when user comes back to tab
        revalidateOnReconnect: true, // fresh data when network reconnects
        keepPreviousData: true,      // show old data while new data loads (no flash)
        errorRetryCount: 2,          // retry API failures up to 2 times
        errorRetryInterval: 3_000,   // wait 3 s between retries
        shouldRetryOnError: true,
      }}
    >
      {children}
    </SWRConfig>
  );
}
