import Image from 'next/image';
import Link from 'next/link';

import { SocialLinks } from './social-links';
import { ThemeToggle } from './theme-toggle';

export function Navbar() {
    return (
        <header className="site-header">
            <nav className="site-nav">
                <Link href="/" className="nav-logo">
                    <Image
                        src="/assets/libre-devops-white.png"
                        alt="Libre DevOps logo"
                        width={36}
                        height={36}
                        priority
                    />
                    <span className="nav-logo-text">Libre DevOps</span>
                </Link>

                <div className="nav-right">
                    <div className="nav-scroll">
                        <Link href="/docs" className="nav-link">Docs</Link>
                        <Link href="/projects" className="nav-link">Projects</Link>
                        <Link href="/about" className="nav-link">About</Link>
                        <SocialLinks />
                        <ThemeToggle />
                    </div>
                </div>
            </nav>
        </header>
    );
}
