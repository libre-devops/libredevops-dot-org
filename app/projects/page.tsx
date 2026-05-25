import { Metadata } from 'next';
import { ExternalLink } from 'lucide-react';

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
        title: 'Azure DevOps Agent Containers',
        description:
            'Pre-built container images for self-hosted Azure DevOps pipeline agents on Linux (RHEL 8 UBI, Ubuntu) and Windows (Server 2019/2022 LTSC). Images are published weekly to GitHub Container Registry. Agent names are auto-generated to avoid pool conflicts. Builds use Podman on Linux and Docker on Windows.',
        tags: ['Azure DevOps', 'Containers', 'Podman', 'Docker', 'CI/CD'],
        repo: 'https://github.com/libre-devops/azdo-agent-containers',
        docs: '/docs/documents/azure-devops-agent-container',
    },
    {
        title: 'Terraform Modules',
        description:
            'A collection of opinionated Terraform modules for Azure infrastructure — covering compute, networking, identity, storage, and more. All modules follow the Libre DevOps naming convention and are published to the Terraform Registry.',
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
        </main>
    );
}
