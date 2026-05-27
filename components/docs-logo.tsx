'use client';

import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function DocsLogo() {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    const wrapperStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
    };

    const textStyle: React.CSSProperties = {
        fontSize: '1.05rem',
        fontWeight: 700,
        letterSpacing: '-0.01em',
    };

    if (!mounted) {
        return (
            <span style={wrapperStyle}>
                <span style={{ width: 28, height: 28, display: 'inline-block' }} />
                <span style={textStyle}>Libre DevOps</span>
            </span>
        );
    }

    const src = resolvedTheme === 'light'
        ? '/assets/libre-devops-black.png'
        : '/assets/libre-devops-white.png';

    return (
        <span style={wrapperStyle}>
            <Image src={src} alt="Libre DevOps logo" width={28} height={28} priority />
            <span style={textStyle}>Libre DevOps</span>
        </span>
    );
}
