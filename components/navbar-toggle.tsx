'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useEffect, useSyncExternalStore } from 'react';

import {
    getBannerHidden,
    getBannerHiddenOnServer,
    setBannerHidden,
    subscribeBannerHidden,
} from '@/lib/banner';

export function NavbarToggle() {
    const hidden = useSyncExternalStore(
        subscribeBannerHidden,
        getBannerHidden,
        getBannerHiddenOnServer,
    );

    // Mirror the preference onto the DOM, which React does not own.
    useEffect(() => {
        document.body.classList.toggle('banner-hidden', hidden);
        // The preload class on <html> was set by an inline script before React
        // hydrated; hand control back to the body class now.
        document.documentElement.classList.remove('banner-hidden-preload');

        // The banner-hidden preference is docs-only. When the user navigates
        // away from /docs/* this component unmounts; restore the banner so it
        // reappears on the marketing pages.
        return () => {
            document.body.classList.remove('banner-hidden');
        };
    }, [hidden]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === '\\') {
                e.preventDefault();
                setBannerHidden(!getBannerHidden());
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    const toggle = () => setBannerHidden(!hidden);

    return (
        <button
            onClick={toggle}
            className="docs-change-btn"
            aria-label={hidden ? 'Show site banner (Ctrl+\\)' : 'Hide site banner (Ctrl+\\)'}
            title={hidden ? 'Show site banner (Ctrl+\\)' : 'Hide site banner (Ctrl+\\)'}
        >
            {hidden ? <Eye size={14} /> : <EyeOff size={14} />}
            {hidden ? 'Show banner' : 'Hide banner'}
        </button>
    );
}
