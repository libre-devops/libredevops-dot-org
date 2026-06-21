import { Metadata } from 'next';
import { ExternalLink } from 'lucide-react';

import { ScrollNav } from '@/components/scroll-nav';

export const metadata: Metadata = {
    title: 'Projects',
    description: 'Open-source projects from Libre DevOps covering platform engineering, Azure, and DevOps tooling.',
};

interface Project {
    title: string;
    description: string;
    tags: string[];
    repo: string;
    docs?: string;
    docsLabel?: string;
}

const projects: Project[] = [
    {
        title: 'Azure Logic App Standards',
        description:
            'Comprehensive standards for deploying production-grade Azure Logic Apps. Covers hosting model selection, naming conventions, trigger patterns, networking, error handling, Terraform patterns, and dependency management with decision trees and real-world examples.',
        tags: ['Azure', 'Logic Apps', 'Standards', 'Best Practices'],
        repo: 'https://github.com/libre-devops',
        docs: '/docs/documents/azure-logic-app-standards',
    },
    {
        title: 'Azure Naming Convention',
        description:
            'A policy set implementing the recommended Microsoft Azure resource abbreviations. Enforces consistent prefix/infix/outfix/suffix naming patterns across all Azure resource types in your Terraform CI/CD pipeline, and is designed to be forked and tailored to your organisation.',
        tags: ['Terraform', 'Azure', 'Naming', 'Policy'],
        repo: 'https://github.com/libre-devops/azure-naming-convention',
        docs: '/docs/documents/azure-naming-convention',
    },
    {
        title: 'Bash Standards',
        description:
            'Production-grade standards for writing, structuring, testing, and operating Bash. Covers strict mode and safety, coding style and naming, quoting, functions, error handling and traps, structured logging, observability and Azure telemetry sync, ShellCheck and bats testing, and CI/CD. Targets Bash 4.4+.',
        tags: ['Bash', 'Standards', 'Best Practices', 'Shell'],
        repo: 'https://github.com/libre-devops',
        docs: '/docs/documents/bash-standards',
    },
    {
        title: 'CI/CD Standards',
        description:
            'Enterprise CI/CD and secure SDLC standards. Covers pipeline stages, trunk-based branching and pull-request gates, OIDC identity, secret scanning and git-leak prevention, SAST and dependency scanning, supply-chain hardening, build-once artifacts, and gated multi-environment deployment. Language-agnostic, with GitHub Actions as the worked example.',
        tags: ['CI/CD', 'DevSecOps', 'SDLC', 'GitHub Actions'],
        repo: 'https://github.com/libre-devops',
        docs: '/docs/documents/cicd-standards',
    },
    {
        title: 'Logging Standards',
        description:
            'Enterprise, language-agnostic standards for application logging. Covers structured JSON over stdout, canonical log levels with OpenTelemetry severity mapping, ISO-8601 UTC timestamps, trace correlation, secret and PII hygiene, and exporting to OpenTelemetry, Azure Monitor / Application Insights, and AWS CloudWatch - with reference implementations in PowerShell, Bash, Python, C#, Go, and TypeScript.',
        tags: ['Logging', 'Observability', 'OpenTelemetry', 'Standards'],
        repo: 'https://github.com/libre-devops',
        docs: '/docs/documents/logging-standards',
    },
    {
        title: 'PowerShell Helpers',
        description:
            'A PowerShell module of reusable helper functions for DevOps automation - covering Azure authentication and resource operations, Terraform orchestration, environment and secret handling, and CI/CD glue. Published to the PowerShell Gallery and importable with Install-Module LibreDevOpsHelpers.',
        tags: ['PowerShell', 'Module', 'Azure', 'DevOps'],
        repo: 'https://github.com/libre-devops/powershell-helpers',
        docs: 'https://www.powershellgallery.com/packages/LibreDevOpsHelpers',
        docsLabel: 'Gallery',
    },
    {
        title: 'PowerShell Standards',
        description:
            'Production-grade standards for authoring, structuring, testing, and operating PowerShell. Covers coding style and naming, strict mode and structured error handling, logging, OpenTelemetry tracing, Azure Monitor telemetry sync, Pester testing, module publishing, and CI/CD. Targets PowerShell 7.4+.',
        tags: ['PowerShell', 'Standards', 'Best Practices', 'Observability'],
        repo: 'https://github.com/libre-devops',
        docs: '/docs/documents/powershell-standards',
    },
    {
        title: 'Python Standards',
        description:
            'Production-grade standards for writing, structuring, testing, and operating Python. Covers PEP 8 style and naming, type hints and static analysis, error handling, structured logging, OpenTelemetry, Azure Monitor telemetry sync, pytest testing, packaging, and CI/CD. Targets Python 3.12+.',
        tags: ['Python', 'Standards', 'Best Practices', 'Observability'],
        repo: 'https://github.com/libre-devops',
        docs: '/docs/documents/python-standards',
    },
    {
        title: 'Terraform Modules',
        description:
            'A collection of opinionated Terraform modules for Azure infrastructure - covering compute, networking, identity, storage, and more. All modules follow the Libre DevOps naming convention and are published to the Terraform Registry.',
        tags: ['Terraform', 'Azure', 'IaC', 'Modules'],
        repo: 'https://github.com/libre-devops',
        docs: 'https://registry.terraform.io/namespaces/libre-devops',
    },
    {
        title: 'Terraform Standards',
        description:
            'Production-ready standards for Terraform module development, file structure, provider pinning, state management, CI/CD pipelines, and registry publishing. Includes maintainer scripts for sorting variables, outputs, and generating documentation.',
        tags: ['Terraform', 'Standards', 'Best Practices', 'IaC'],
        repo: 'https://github.com/libre-devops',
        docs: '/docs/documents/terraform-standards',
    },
];

export default function ProjectsPage() {
    return (
        <main>
            <section className="content-section">
                <div className="content-container">
                    <h1 className="content-title">Projects</h1>
                    <p className="content-intro">
                        Open-source tooling and reference implementations. All source is on GitHub
                        and built for production use cases.
                    </p>

                    <div className="project-grid">
                        {projects.map((project) => (
                            <article key={project.title} className="project-card">
                                <div className="project-card-header">
                                    <h2 className="project-card-title">{project.title}</h2>
                                    <div className="project-card-links">
                                        <a
                                            href={project.repo}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="project-card-link"
                                            aria-label={`${project.title} on GitHub`}
                                        >
                                            <ExternalLink size={14} />
                                            GitHub
                                        </a>
                                        {project.docs && (
                                            <a
                                                href={project.docs}
                                                className="project-card-link project-card-link--docs"
                                                aria-label={`${project.title} ${project.docsLabel ?? 'documentation'}`}
                                                {...(project.docs.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                                            >
                                                {project.docsLabel ?? 'Docs'}
                                            </a>
                                        )}
                                    </div>
                                </div>

                                <p className="project-card-description">{project.description}</p>

                                <div className="project-card-tags">
                                    {project.tags.map((tag) => (
                                        <span key={tag} className="project-tag">{tag}</span>
                                    ))}
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>
            <ScrollNav />
        </main>
    );
}
