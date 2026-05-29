'use client';

import { ArrowUpToLine, ArrowDownToLine } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * Fixed, context-aware scroll controls for long content pages (cheatsheets,
 * standards docs, projects). Shows "to bottom" near the top, "to top" near the
 * bottom, both in between, and nothing on pages too short to scroll. Uses
 * position:fixed so it never affects layout width.
 */
export function ScrollNav() {
    const [atTop, setAtTop] = useState(true);
    const [atBottom, setAtBottom] = useState(false);
    const [scrollable, setScrollable] = useState(false);

    useEffect(() => {
        const update = () => {
            const doc = document.documentElement;
            const scrollTop = window.scrollY || doc.scrollTop;
            const viewport = window.innerHeight;
            const full = doc.scrollHeight;
            // Only surface the control when there's a meaningful amount to scroll.
            setScrollable(full - viewport > 240);
            setAtTop(scrollTop < 120);
            setAtBottom(scrollTop + viewport >= full - 120);
        };
        update();
        window.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update);
        return () => {
            window.removeEventListener('scroll', update);
            window.removeEventListener('resize', update);
        };
    }, []);

    if (!scrollable) return null;

    const behavior: ScrollBehavior = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
    ).matches
        ? 'auto'
        : 'smooth';

    const toTop = () => window.scrollTo({ top: 0, behavior });
    const toBottom = () =>
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior });

    return (
        <div className="scroll-nav">
            {!atTop && (
                <button
                    type="button"
                    className="scroll-nav-btn"
                    onClick={toTop}
                    aria-label="Scroll to top"
                    title="Scroll to top"
                >
                    <ArrowUpToLine size={18} aria-hidden="true" />
                </button>
            )}
            {!atBottom && (
                <button
                    type="button"
                    className="scroll-nav-btn"
                    onClick={toBottom}
                    aria-label="Scroll to bottom"
                    title="Scroll to bottom"
                >
                    <ArrowDownToLine size={18} aria-hidden="true" />
                </button>
            )}
        </div>
    );
}
