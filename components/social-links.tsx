import { Key, Mail, Shield } from 'lucide-react';
import type { ReactNode } from 'react';

import { socialLinks } from '@/lib/site';

function GithubIcon() {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
        </svg>
    );
}

function LinkedinIcon() {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
            <rect x="2" y="9" width="4" height="12" />
            <circle cx="4" cy="4" r="2" />
        </svg>
    );
}

function TerraformIcon() {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 32 32"
            fill="currentColor"
            aria-hidden="true"
        >
            <path d="M12.042 6.858L19.957 11.358V20.358L12.042 15.858V6.858Z" />
            <path d="M20.956 11.358L28.871 6.858V15.858L20.956 20.358V11.358Z" />
            <path d="M3.129 1.358L11.044 5.858V14.858L3.129 10.358V1.358Z" />
            <path d="M12.042 17.142L19.957 21.642V30.642L12.042 26.142V17.142Z" />
        </svg>
    );
}

const iconMap: Record<string, ReactNode> = {
    github: <GithubIcon />,
    linkedin: <LinkedinIcon />,
    terraform: <TerraformIcon />,
    key: <Key size={16} />,
    mail: <Mail size={16} />,
    shield: <Shield size={16} />,
};

export function SocialLinks() {
    return (
        <div className="social-links">
            {socialLinks.map((link) => {
                const icon = iconMap[link.icon];
                if (!icon) return null;
                return (
                    <a
                        key={link.label}
                        href={link.mailto ? `mailto:${link.href}` : link.href}
                        {...(!link.mailto && { target: '_blank', rel: 'noopener noreferrer' })}
                        aria-label={link.label}
                        className="social-link"
                    >
                        {icon}
                    </a>
                );
            })}
        </div>
    );
}
