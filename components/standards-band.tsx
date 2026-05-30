import fs from 'node:fs';
import path from 'node:path';

import { ArrowRight } from 'lucide-react';

interface Standard {
    label: string;
    href: string;
}

const DOCS_DIR = path.join(process.cwd(), 'content', 'docs', 'documents');

/**
 * Discover every `*-standards.mdx` doc at build time so new standards appear
 * automatically. The pill label is the frontmatter title with the trailing
 * "Standards" removed (e.g. "Terraform Standards" -> "Terraform").
 */
function getStandards(): Standard[] {
    const files = fs
        .readdirSync(DOCS_DIR)
        .filter((file) => file.endsWith('-standards.mdx'));

    return files
        .map((file) => {
            const source = fs.readFileSync(path.join(DOCS_DIR, file), 'utf8');
            const titleMatch = source.match(/^title:\s*(.+)$/m);
            const slug = file.replace(/\.mdx$/, '');
            const title = titleMatch ? titleMatch[1].trim() : slug;
            const label = title.replace(/\s*Standards$/i, '').trim();

            return { label, href: `/docs/documents/${slug}` };
        })
        .sort((a, b) => a.label.localeCompare(b.label));
}

export function StandardsBand() {
    const standards = getStandards();

    return (
        <div className="standards-band">
            <div className="standards-band-inner">
                <div className="standards-band-copy">
                    <span className="standards-band-eyebrow">Libre DevOps Standards</span>
                    <p className="standards-band-tagline">
                        Battle-tested guides for how to build in production.
                    </p>
                </div>

                <div className="standards-band-pills">
                    {standards.map((s) => (
                        <a key={s.href} href={s.href} className="standards-band-pill">
                            {s.label}
                        </a>
                    ))}
                </div>

                <a href="/projects" className="standards-band-cta">
                    Explore standards
                    <ArrowRight size={16} />
                </a>
            </div>
        </div>
    );
}
