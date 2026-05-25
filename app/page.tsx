import { HeroLogo } from '@/components/hero-logo';

export default function HomePage() {
    return (
        <main>
            <section className="hero">
                <div className="hero-content">
                    <div className="hero-logo">
                        <HeroLogo />
                    </div>
                    <h1 className="hero-title">
                        Platform engineering,<br />done in the open.
                    </h1>
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
                </div>
            </section>
        </main>
    );
}
