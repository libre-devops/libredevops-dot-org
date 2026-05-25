import { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
    title: 'About – Libre DevOps',
    description: 'About Libre DevOps — platform engineering, DevOps, and security engineering in the open.',
};

interface Contributor {
    login: string;
    avatar_url: string;
    html_url: string;
    contributions: number;
}

async function getContributors(): Promise<Contributor[]> {
    try {
        const res = await fetch(
            'https://api.github.com/repos/libre-devops/libredevops-dot-org/contributors',
            {
                headers: { Accept: 'application/vnd.github+json' },
                next: { revalidate: false },
            }
        );
        if (!res.ok) return [];
        return res.json();
    } catch {
        return [];
    }
}

export default async function AboutPage() {
    const contributors = await getContributors();

    return (
        <main>
            <section className="content-section">
                <div className="content-container">
                    <h1 className="content-title">About</h1>

                    <div className="content-body">
                        <p>
                            Libre DevOps is a portfolio and knowledge base maintained by{' '}
                            <a
                                href="https://linkedin.com/in/craig-thacker"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="content-link"
                            >
                                Craig Thacker
                            </a>
                            , a platform and security engineer. The site is a public reference for
                            tooling, patterns, and documentation built up over years of work across
                            cloud infrastructure, DevOps, and security engineering.
                        </p>

                        <p>
                            The work here spans Terraform modules, Azure platform patterns, CI/CD
                            automation, container builds, and security tooling — most of it
                            published under open-source licenses and available on{' '}
                            <a
                                href="https://github.com/libre-devops"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="content-link"
                            >
                                GitHub
                            </a>
                            . The goal is to share reusable, production-tested approaches rather
                            than toy examples.
                        </p>

                        <p>
                            Contributions and issue reports are welcome. If something is wrong,
                            outdated, or missing, raising a pull request or filing an issue is the
                            fastest way to get it fixed.
                        </p>

                        <h2 className="content-heading">What you&apos;ll find here</h2>

                        <ul className="content-list">
                            <li>
                                <strong>Docs &amp; cheatsheets</strong> — reference material for
                                Terraform, Azure, Linux, PowerShell, containers, and more.
                            </li>
                            <li>
                                <strong>Projects</strong> — open-source tools and modules built
                                for real-world platform and infrastructure use cases.
                            </li>
                            <li>
                                <strong>Security news</strong> — a separate feed at{' '}
                                <a
                                    href="https://security.libredevops.org"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="content-link"
                                >
                                    security.libredevops.org
                                </a>{' '}
                                aggregating curated security and threat intelligence content.
                            </li>
                        </ul>

                        <h2 className="content-heading">Stack</h2>

                        <p>
                            The site is built with Next.js and Nextra, hosted as a static export
                            on GitHub Pages, and deployed via GitHub Actions on every push to
                            main. Source is public at{' '}
                            <a
                                href="https://github.com/libre-devops/libredevops-dot-org"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="content-link"
                            >
                                libre-devops/libredevops-dot-org
                            </a>
                            .
                        </p>
                    </div>

                    {contributors.length > 0 && (
                        <div className="contributors-section">
                            <h2 className="content-heading">Contributors</h2>
                            <p className="contributors-note">
                                Everyone who has committed to this repository.
                            </p>
                            <div className="contributors-grid">
                                {contributors.map((c) => (
                                    <a
                                        key={c.login}
                                        href={c.html_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="contributor-card"
                                        title={`${c.login} — ${c.contributions} commit${c.contributions !== 1 ? 's' : ''}`}
                                    >
                                        <Image
                                            src={c.avatar_url}
                                            alt={c.login}
                                            width={48}
                                            height={48}
                                            className="contributor-avatar"
                                            unoptimized
                                        />
                                        <span className="contributor-login">{c.login}</span>
                                        <span className="contributor-commits">
                                            {c.contributions} commit{c.contributions !== 1 ? 's' : ''}
                                        </span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}
