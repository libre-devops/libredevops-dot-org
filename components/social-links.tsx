import { Github, Key, Linkedin, Mail, Shield } from 'lucide-react';
import type { ReactNode } from 'react';

import { socialLinks } from '@/lib/site';

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
    github: <Github size={16} />,
    linkedin: <Linkedin size={16} />,
    terraform: <TerraformIcon />,
    key: <Key size={16} />,
    mail: <Mail size={16} />,
    shield: <Shield size={16} />,
};

export function SocialLinks() {
    return (
        <div className="social-links">
            {socialLinks.map((link) => (
                <a
                    key={link.label}
                    href={link.mailto ? `mailto:${link.href}` : link.href}
                    {...(!link.mailto && { target: '_blank', rel: 'noopener noreferrer' })}
                    aria-label={link.label}
                    className={`social-link${link.mobileVisible ? ' social-link--mobile' : ''}`}
                >
                    {iconMap[link.icon]}
                </a>
            ))}
        </div>
    );
}
