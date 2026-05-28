'use client';

import { useState } from 'react';

interface Cheatsheet {
    title: string;
    href: string;
    description: string;
    tags: string[];
    icon: React.ReactNode;
}

const KqlIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none"
        stroke="#0078d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        aria-hidden="true" style={{ flexShrink: 0, opacity: 0.85 }}>
        <ellipse cx="12" cy="5" rx="9" ry="3"/>
        <path d="M3 5V19A9 3 0 0 0 21 19V5"/>
        <path d="M3 12A9 3 0 0 0 21 12"/>
    </svg>
);

function DevIcon({ name, alt, width = 28 }: { name: string; alt: string; width?: number }) {
    return (
        <img
            src={`https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${name}`}
            alt={alt}
            width={width}
            height={28}
            style={{ flexShrink: 0, opacity: 0.85 }}
        />
    );
}

const CHEATSHEETS: Cheatsheet[] = [
    {
        title: 'Terraform',
        href: '/docs/cheatsheets/terraform',
        description: 'Practical snippets for Azure infrastructure - number formatting, type conversions, dynamic blocks, state management, OS detection, and workflow automation.',
        tags: ['HCL', 'Azure', 'IaC'],
        icon: <DevIcon name="terraform/terraform-original.svg" alt="Terraform" />,
    },
    {
        title: 'Ansible',
        href: '/docs/cheatsheets/ansible-cheatsheet',
        description: 'Installation, static and dynamic inventory, ad-hoc commands, playbook structure, roles, variables, Jinja2 templates, vault encryption, collections, and common modules.',
        tags: ['Ansible', 'IaC', 'Automation', 'Linux'],
        icon: <DevIcon name="ansible/ansible-original.svg" alt="Ansible" />,
    },
    {
        title: 'Git',
        href: '/docs/cheatsheets/git-cheatsheet',
        description: 'Configuration templates, core operations, branching, remotes, undoing changes, history inspection, and bulk automation scripts for GitHub and Azure DevOps.',
        tags: ['Git', 'GitHub', 'Azure DevOps'],
        icon: <DevIcon name="git/git-original.svg" alt="Git" />,
    },
    {
        title: 'AWS',
        href: '/docs/cheatsheets/aws-cheatsheet',
        description: 'CLI setup, named profiles, S3 operations, EC2, IAM, EKS kubeconfig, and CloudFormation deploy commands.',
        tags: ['AWS CLI', 'S3', 'EC2', 'IAM', 'EKS'],
        icon: <DevIcon name="amazonwebservices/amazonwebservices-plain-wordmark.svg" alt="AWS" width={36} />,
    },
    {
        title: 'Azure',
        href: '/docs/cheatsheets/azure-cheatsheet',
        description: 'Authentication helpers for Az PowerShell and Azure CLI (interactive and SPN), policy assignment queries, and common az commands.',
        tags: ['Az CLI', 'PowerShell', 'Policy'],
        icon: <DevIcon name="azure/azure-original.svg" alt="Azure" />,
    },
    {
        title: 'Go',
        href: '/docs/cheatsheets/go-cheatsheet',
        description: 'Modules, types, interfaces, error handling, generics, goroutines, channels, HTTP server, slog, testing, and Azure SDK authentication with blob storage and Key Vault.',
        tags: ['Go', 'Concurrency', 'Azure SDK'],
        icon: <DevIcon name="go/go-original.svg" alt="Go" width={40} />,
    },
    {
        title: 'KQL',
        href: '/docs/cheatsheets/kql-cheatsheet',
        description: 'KQL fundamentals, time filtering, string ops, aggregations, joins, and threat hunting queries across Defender and Sentinel tables - processes, network, identity, email, alerts, and incidents.',
        tags: ['KQL', 'Sentinel', 'Defender', 'ADX'],
        icon: KqlIcon,
    },
    {
        title: 'Bash',
        href: '/docs/cheatsheets/bash-cheatsheet',
        description: 'Script boilerplate, strict mode, colour output helpers, argument parsing, PATH deduplication, and directory-iteration patterns.',
        tags: ['Bash', 'Shell', 'Linux'],
        icon: <DevIcon name="bash/bash-original.svg" alt="Bash" />,
    },
    {
        title: 'Containers',
        href: '/docs/cheatsheets/containers-cheatsheet',
        description: 'Docker setup scripts, Podman pod creation, Docker Compose examples, Kubernetes pod manifests, and nginx reverse proxy configs.',
        tags: ['Docker', 'Podman', 'Kubernetes'],
        icon: <DevIcon name="docker/docker-original.svg" alt="Docker" />,
    },
    {
        title: 'Linux',
        href: '/docs/cheatsheets/linux-cheatsheet',
        description: 'Ubuntu and Fedora/RHEL setup scripts - Homebrew, PowerShell, Starship, pyenv, tfenv, developer tools, CA certificates, and WSL2 configuration.',
        tags: ['Ubuntu', 'Fedora', 'WSL2'],
        icon: <DevIcon name="linux/linux-original.svg" alt="Linux" />,
    },
    {
        title: 'Nginx',
        href: '/docs/cheatsheets/nginx-cheatsheet',
        description: 'HTTPS reverse proxy configs with WebSocket support, HTTP to HTTPS redirects, and service-specific headers for Jenkins, Gitea, and Nexus.',
        tags: ['Nginx', 'HTTPS', 'Proxy'],
        icon: <DevIcon name="nginx/nginx-original.svg" alt="Nginx" />,
    },
    {
        title: 'PowerShell',
        href: '/docs/cheatsheets/powershell-cheatsheet',
        description: 'Azure auth helpers, resource provider registration, Terraform pipeline functions, module management, and Sentinel watchlist export.',
        tags: ['PowerShell', 'Azure', 'Terraform'],
        icon: <DevIcon name="powershell/powershell-original.svg" alt="PowerShell" />,
    },
    {
        title: 'Python',
        href: '/docs/cheatsheets/python-cheatsheet',
        description: 'Virtual environment helpers, Azure SDK authentication, metadata service queries, Azure Functions with Managed Identity, and Terraform file sorting utilities.',
        tags: ['Python', 'Azure SDK', 'Terraform'],
        icon: <DevIcon name="python/python-original.svg" alt="Python" />,
    },
    {
        title: 'Security',
        href: '/docs/cheatsheets/security-cheatsheet',
        description: 'nmap, netcat, curl, openssl, PowerShell recon, JavaScript console, git secret hunting, grep/ripgrep regex patterns, ffuf web fuzzing, SSH tunnelling, socat encrypted shells, and SQLMap injection testing.',
        tags: ['nmap', 'netcat', 'ffuf', 'SSH', 'SQLMap'],
        icon: <DevIcon name="kalilinux/kalilinux-original.svg" alt="Security" />,
    },
    {
        title: 'Windows',
        href: '/docs/cheatsheets/windows-cheatsheet',
        description: 'TCP port listeners, Scoop package management, WSL2 configuration, firewall rules, system diagnostics, and environment variable management.',
        tags: ['Windows', 'PowerShell', 'WSL2'],
        icon: <DevIcon name="windows8/windows8-original.svg" alt="Windows" />,
    },
    {
        title: 'TypeScript',
        href: '/docs/cheatsheets/typescript-cheatsheet',
        description: 'nvm setup, tsconfig, core types, generics, utility types, classes, discriminated unions, async patterns, Next.js App Router, server actions, route handlers, and Vitest testing.',
        tags: ['TypeScript', 'Next.js', 'Vitest'],
        icon: <DevIcon name="typescript/typescript-original.svg" alt="TypeScript" />,
    },
    {
        title: '.NET',
        href: '/docs/cheatsheets/dotnet-cheatsheet',
        description: 'dotnet CLI, interfaces, classes, records, pattern matching, LINQ, async patterns, dependency injection, Azure SDK authentication, Key Vault, Blob Storage, ARM, Kusto SDK, Log Analytics, and xUnit testing.',
        tags: ['.NET', 'C#', 'Azure SDK', 'Kusto'],
        icon: <DevIcon name="dotnetcore/dotnetcore-original.svg" alt=".NET" />,
    },
];

function matches(sheet: Cheatsheet, query: string): boolean {
    const q = query.toLowerCase();
    return (
        sheet.title.toLowerCase().includes(q) ||
        sheet.description.toLowerCase().includes(q) ||
        sheet.tags.some(t => t.toLowerCase().includes(q))
    );
}

export function CheatsheetGrid() {
    const [query, setQuery] = useState('');
    const filtered = query ? CHEATSHEETS.filter(s => matches(s, query)) : CHEATSHEETS;

    return (
        <>
            <div className="cheatsheet-search-wrapper">
                <svg className="cheatsheet-search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                </svg>
                <input
                    type="search"
                    className="cheatsheet-search-input"
                    placeholder="Filter cheatsheets…"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    aria-label="Filter cheatsheets"
                />
            </div>

            {filtered.length > 0 ? (
                <div className="project-grid" style={{ marginTop: '1.5rem' }}>
                    {filtered.map(sheet => (
                        <a key={sheet.href} href={sheet.href} className="project-card"
                            style={{ display: 'block', textDecoration: 'none' }}>
                            <div className="project-card-header">
                                <h2 className="project-card-title">{sheet.title}</h2>
                                {sheet.icon}
                            </div>
                            <div className="project-card-description">{sheet.description}</div>
                            <div className="project-card-tags">
                                {sheet.tags.map(tag => (
                                    <span key={tag} className="project-tag">{tag}</span>
                                ))}
                            </div>
                        </a>
                    ))}
                </div>
            ) : (
                <p className="cheatsheet-search-empty">No cheatsheets match &ldquo;{query}&rdquo;.</p>
            )}
        </>
    );
}
