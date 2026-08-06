'use client';

import { useSyncExternalStore } from 'react';

// The hydration snapshot flips exactly once, so there is nothing to subscribe to.
const noopSubscribe = () => () => {};

const getTrue = () => true;
const getFalse = () => false;

/**
 * False during SSR and the hydration render, true from the first client render
 * onwards. Prefer this to a `setMounted(true)` effect: it reads the snapshot
 * during render rather than scheduling an extra state update after paint.
 */
export function useMounted(): boolean {
    return useSyncExternalStore(noopSubscribe, getTrue, getFalse);
}

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function subscribeReducedMotion(onStoreChange: () => void): () => void {
    const query = window.matchMedia(REDUCED_MOTION_QUERY);
    query.addEventListener('change', onStoreChange);
    return () => query.removeEventListener('change', onStoreChange);
}

function getReducedMotion(): boolean {
    return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

/**
 * Tracks `prefers-reduced-motion`, responding if the user changes it mid-session.
 * Assumes motion is allowed on the server, matching the pre-hydration markup.
 */
export function usePrefersReducedMotion(): boolean {
    return useSyncExternalStore(subscribeReducedMotion, getReducedMotion, getFalse);
}
