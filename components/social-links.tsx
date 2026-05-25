import { Github, Key, Linkedin, Mail, Shield } from 'lucide-react';

import { siteConfig } from '@/lib/site';

// Terraform Registry has no Lucide icon — use their official logo mark
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

export function SocialLinks() {
    return (
        <div className="social-links">
            <a
                href={siteConfig.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="social-link"
            >
                <Github size={16} />
            </a>

            <a
                href={siteConfig.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="social-link"
            >
                <Linkedin size={16} />
            </a>

            <a
                href={siteConfig.terraform}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Terraform Registry"
                className="social-link"
            >
                <TerraformIcon />
            </a>

            <a
                href={siteConfig.keybase}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Keybase"
                className="social-link"
            >
                <Key size={16} />
            </a>

            <a
                href={`mailto:${siteConfig.email}`}
                aria-label="Email"
                className="social-link"
            >
                <Mail size={16} />
            </a>

            <a
                href={siteConfig.securityNews}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Security News"
                className="social-link"
            >
                <Shield size={16} />
            </a>
        </div>
    );
}
