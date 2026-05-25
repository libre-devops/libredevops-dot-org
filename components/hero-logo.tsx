'use client';

import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function HeroLogo() {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    if (!mounted) {
        // Placeholder matches rendered size to avoid layout shift
        return <div style={{ width: 120, height: 120 }} />;
    }

    const src = resolvedTheme === 'light'
        ? '/assets/libre-devops-black.png'
        : '/assets/libre-devops-white.png';

    return (
        <Image
            src={src}
            alt="Libre DevOps"
            width={120}
            height={120}
            priority
        />
    );
}
