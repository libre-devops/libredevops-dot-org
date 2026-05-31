import type { MetadataRoute } from 'next';

// Required so the route is emitted as a static file under `output: 'export'`.
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: { userAgent: '*', allow: '/' },
        sitemap: 'https://libredevops.org/sitemap.xml',
        host: 'https://libredevops.org',
    };
}
