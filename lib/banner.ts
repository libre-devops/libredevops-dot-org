'use client';

const STORAGE_KEY = 'docs-banner-hidden';

const listeners = new Set<() => void>();

/** Reads the stored preference, treating an unavailable store as "not hidden". */
export function getBannerHidden(): boolean {
    try {
        return localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
        return false;
    }
}

export function getBannerHiddenOnServer(): boolean {
    return false;
}

export function subscribeBannerHidden(onStoreChange: () => void): () => void {
    listeners.add(onStoreChange);
    // `storage` only fires in other tabs, so in-tab writes notify via `listeners`.
    window.addEventListener('storage', onStoreChange);
    return () => {
        listeners.delete(onStoreChange);
        window.removeEventListener('storage', onStoreChange);
    };
}

export function setBannerHidden(hidden: boolean): void {
    try {
        localStorage.setItem(STORAGE_KEY, hidden ? '1' : '0');
    } catch {
        // Storage can be unavailable (private mode); keep the in-tab state working.
    }
    listeners.forEach((listener) => listener());
}
