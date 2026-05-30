import fs from 'node:fs';
import path from 'node:path';

import { ArrowRight } from 'lucide-react';

interface Standard {
    label: string;
    href: string;
}

const DOCS_DIR = path.join(process.cwd(), 'content', 'docs', 'documents');

// Allowlists. Filenames and frontmatter are repo-controlled, but validating
// them anyway keeps only known-safe characters flowing into the href/label
// (and stops untrusted values reaching the DOM - see js/stored-xss).
const SLUG_PATTERN = /^[a-z0-9-]+$/;
const TITLE_PATTERN = /^[A-Za-z0-9 .,&/()+-]+$/;

/** Derive a display label from a validated slug, e.g. "azure-logic-app". */
function slugToLabel(slug: string): string {
    return slug
        .replace(/-standards$/, '')
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

/**
 * Discover every `*-standards.mdx` doc at build time so new standards appear
 * automatically. The pill label is the frontmatter title with the trailing
 * "Standards" removed (e.g. "Terraform Standards" -> "Terraform"); titles that
 * contain anything outside the allowlist fall back to the slug-derived label.
 */
function getStandards(): Standard[] {
    return fs
        .readdirSync(DOCS_DIR)
        .filter((file) => file.endsWith('-standards.mdx'))
        .map((file): Standard | null => {
            const slug = file.replace(/\.mdx$/, '');
            // Reject any slug that isn't a plain lowercase/digit/hyphen name.
            if (!SLUG_PATTERN.test(slug)) return null;

            const source = fs.readFileSync(path.join(DOCS_DIR, file), 'utf8');
            const rawTitle = source.match(/^title:\s*(.+)$/m)?.[1].trim() ?? '';
            const label = TITLE_PATTERN.test(rawTitle)
                ? rawTitle.replace(/\s*Standards$/i, '').trim()
                : slugToLabel(slug);

            return { label, href: `/docs/documents/${slug}` };
        })
        .filter((s): s is Standard => s !== null)
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
