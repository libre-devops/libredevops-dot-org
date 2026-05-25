export const siteConfig = {
    name: 'Libre DevOps',
    description: 'Platform engineering, DevOps and security engineering.',
    url: 'https://libredevops.org',
    github: 'https://github.com/libre-devops',
    repo: 'https://github.com/libre-devops/libredevops-dot-org',
    securityNews: 'https://security.libredevops.org',
    linkedin: 'https://linkedin.com/in/craig-thacker',
    terraform: 'https://registry.terraform.io/namespaces/libre-devops',
    keybase: 'https://keybase.io/craigthacker',
    x: '',
    email: 'craig@craigthacker.dev',
    docsChangeRequest:
        'https://github.com/libre-devops/libredevops-dot-org/issues/new?template=docs_change_request.md&title=%5BDocs%5D%3A+',
};

export interface SocialLink {
    href: string;
    label: string;
    icon: string; // key into the icon map in social-links.tsx
    /** Show on mobile navbar. Keep to 3 max to avoid overflow. */
    mobileVisible?: boolean;
    /** Use mailto: prefix for email links */
    mailto?: boolean;
}

export const socialLinks: SocialLink[] = [
    {
        href: siteConfig.github,
        label: 'GitHub',
        icon: 'github',
    },
    {
        href: siteConfig.linkedin,
        label: 'LinkedIn',
        icon: 'linkedin',
        mobileVisible: true,
    },
    {
        href: siteConfig.terraform,
        label: 'Terraform Registry',
        icon: 'terraform',
        mobileVisible: true,
    },
    {
        href: siteConfig.keybase,
        label: 'Keybase',
        icon: 'key',
    },
    {
        href: siteConfig.email,
        label: 'Email',
        icon: 'mail',
        mailto: true,
    },
    {
        href: siteConfig.securityNews,
        label: 'Security News',
        icon: 'shield',
        mobileVisible: true,
    },
];
