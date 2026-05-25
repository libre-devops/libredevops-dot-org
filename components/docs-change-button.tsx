import { MessageSquarePlus } from 'lucide-react'

import { siteConfig } from '@/lib/site'

export function DocsChangeButton({ page }: { page?: string }) {
    const url = page
        ? `${siteConfig.docsChangeRequest}${encodeURIComponent(page)}`
        : siteConfig.docsChangeRequest

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="docs-change-btn"
            aria-label="Suggest a change to this page"
        >
            <MessageSquarePlus size={14} />
            Suggest a change
        </a>
    )
}
