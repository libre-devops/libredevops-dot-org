import fs from 'node:fs';
import path from 'node:path';

import type { MetadataRoute } from 'next';

// Required so the route is emitted as a static file under `output: 'export'`.
export const dynamic = 'force-static';

const BASE = 'https://libredevops.org';
const DOCS_DIR = path.join(process.cwd(), 'content', 'docs');

// Map every content/docs/**/*.mdx file to its public route. `index.mdx`
// becomes the directory route (e.g. cheatsheets/index.mdx -> /docs/cheatsheets).
function docRoutes(): string[] {
    const routes = new Set<string>();

    const walk = (dir: string) => {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                walk(full);
                continue;
            }
            if (!entry.name.endsWith('.mdx')) continue;

            const rel = path
                .relative(DOCS_DIR, full)
                .replace(/\.mdx$/, '')
                .replace(/\\/g, '/');

            if (rel === 'index') {
                routes.add('/docs');
            } else if (rel.endsWith('/index')) {
                routes.add(`/docs/${rel.slice(0, -'/index'.length)}`);
            } else {
                routes.add(`/docs/${rel}`);
            }
        }
    };

    walk(DOCS_DIR);
    return [...routes];
}

export default function sitemap(): MetadataRoute.Sitemap {
    const lastModified = new Date();
    const routes = new Set<string>(['/', '/about', '/projects', ...docRoutes()]);

    return [...routes].sort().map((route) => ({
        url: `${BASE}${route}`,
        lastModified,
        changeFrequency: 'weekly',
        priority: route === '/' ? 1 : 0.7,
    }));
}
