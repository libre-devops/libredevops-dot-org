import { HeroLogo } from '@/components/hero-logo';
import { Terminal } from '@/components/terminal';
import { StandardsBand } from '@/components/standards-band';
import { RotatingTitle } from '@/components/rotating-title';

export default function HomePage() {
    return (
        <main>
            <section className="hero">
                <div className="hero-content">
                    <div className="hero-logo">
                        <HeroLogo />
                    </div>
                    <RotatingTitle />
                    <p className="hero-subtitle">
                        Libre DevOps publishes open-source tooling, cheatsheets, and guides
                        covering DevOps, platform engineering, and security.
                    </p>
                    <div className="hero-actions">
                        <a href="/docs" className="btn-primary">Browse Docs</a>
                        <a
                            href="https://security.libredevops.org"
                            className="btn-secondary"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Security News
                        </a>
                    </div>
                    <StandardsBand />
                    <Terminal />
                </div>
            </section>
        </main>
    );
}
