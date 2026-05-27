'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'docs-banner-hidden';

export function NavbarToggle() {
    const [hidden, setHidden] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY) === '1';
        setHidden(stored);
        document.body.classList.toggle('banner-hidden', stored);
        // The preload class on <html> was set by an inline script before React
        // hydrated; hand control back to the body class now.
        document.documentElement.classList.remove('banner-hidden-preload');

        // The banner-hidden preference is docs-only. When the user navigates
        // away from /docs/* this component unmounts; restore the banner so it
        // reappears on the marketing pages.
        return () => {
            document.body.classList.remove('banner-hidden');
        };
    }, []);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === '\\') {
                e.preventDefault();
                setHidden(prev => {
                    const next = !prev;
                    localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
                    document.body.classList.toggle('banner-hidden', next);
                    return next;
                });
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    const toggle = () => {
        const next = !hidden;
        setHidden(next);
        localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
        document.body.classList.toggle('banner-hidden', next);
    };

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
