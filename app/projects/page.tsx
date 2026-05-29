import { Metadata } from 'next';
import { ExternalLink } from 'lucide-react';

import { ScrollNav } from '@/components/scroll-nav';

export const metadata: Metadata = {
    title: 'Projects – Libre DevOps',
    description: 'Open-source projects from Libre DevOps covering platform engineering, Azure, and DevOps tooling.',
};

interface Project {
    title: string;
    description: string;
    tags: string[];
    repo: string;
    docs?: string;
}

const projects: Project[] = [
    {
        title: 'Azure Naming Convention',
        description:
            'A terraform-compliance policy set implementing the recommended Microsoft Azure resource abbreviations. Enforces consistent prefix/infix/outfix/suffix naming patterns across all Azure resource types in your Terraform CI/CD pipeline. Supports BDD-style policy tests and is designed to be forked and tailored to your organisation.',
        tags: ['Terraform', 'terraform-compliance', 'Azure', 'Policy'],
        repo: 'https://github.com/libre-devops/azure-naming-convention',
        docs: '/docs/documents/azure-naming-convention',
    },
    {
        title: 'Terraform Standards',
        description:
            'Production-ready standards for Terraform module development, file structure, provider pinning, state management, CI/CD pipelines, and registry publishing. Includes maintainer scripts for sorting variables, outputs, and generating documentation.',
        tags: ['Terraform', 'Standards', 'Best Practices', 'IaC'],
        repo: 'https://github.com/libre-devops',
        docs: '/docs/documents/terraform-standards',
    },
    {
        title: 'Azure Logic App Standards',
        description:
            'Comprehensive standards for deploying production-grade Azure Logic Apps. Covers hosting model selection, naming conventions, trigger patterns, networking, error handling, Terraform patterns, and dependency management with decision trees and real-world examples.',
        tags: ['Azure', 'Logic Apps', 'Standards', 'Best Practices'],
        repo: 'https://github.com/libre-devops',
        docs: '/docs/documents/azure-logic-app-standards',
    },
    {
        title: 'Terraform Modules',
        description:
            'A collection of opinionated Terraform modules for Azure infrastructure - covering compute, networking, identity, storage, and more. All modules follow the Libre DevOps naming convention and are published to the Terraform Registry.',
        tags: ['Terraform', 'Azure', 'IaC', 'Modules'],
        repo: 'https://github.com/libre-devops',
        docs: 'https://registry.terraform.io/namespaces/libre-devops',
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
                                                aria-label={`${project.title} documentation`}
                                                {...(project.docs.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                                            >
                                                Docs
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
