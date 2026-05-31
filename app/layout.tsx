import './globals.css';
import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';

import { Navbar } from '@/components/navbar';

const SITE_DESCRIPTION =
    'Open-source platform engineering standards, cheatsheets, and tooling for DevOps, Azure, Terraform, and security.';

export const metadata: Metadata = {
    // `default` is used by pages without their own title; `template` brands every
    // page that sets one (e.g. "Terraform Standards" -> "Terraform Standards | Libre DevOps").
    title: {
        default: 'Libre DevOps - Platform Engineering, DevOps & Security',
        template: '%s | Libre DevOps',
    },
    description: SITE_DESCRIPTION,
    metadataBase: new URL('https://libredevops.org'),
    openGraph: {
        // Deliberately no title/description here: leaving them unset lets each page's
        // own title and description drive its link preview, instead of every page
        // inheriting the homepage's. type/siteName/image/locale are site-wide.
        type: 'website',
        siteName: 'Libre DevOps',
        locale: 'en_GB',
        images: [{ url: '/assets/libre-devops-white-bg.png', alt: 'Libre DevOps' }],
    },
    icons: {
        icon: '/assets/libre-devops-favicon.png',
        apple: '/assets/libre-devops-favicon.png'
    }
};

// Site-wide structured data so search engines understand the brand and entity.
const STRUCTURED_DATA = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'Organization',
            '@id': 'https://libredevops.org/#organization',
            name: 'Libre DevOps',
            url: 'https://libredevops.org',
            logo: 'https://libredevops.org/assets/libre-devops-white-bg.png',
            sameAs: ['https://github.com/libre-devops'],
        },
        {
            '@type': 'WebSite',
            '@id': 'https://libredevops.org/#website',
            name: 'Libre DevOps',
            url: 'https://libredevops.org',
            publisher: { '@id': 'https://libredevops.org/#organization' },
        },
    ],
};

export default function RootLayout({
                                       children
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
        <head>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
            />
            <script
                dangerouslySetInnerHTML={{
                    __html: `(function(){try{if(location.pathname.indexOf('/docs')===0&&localStorage.getItem('docs-banner-hidden')==='1'){document.documentElement.classList.add('banner-hidden-preload')}}catch(e){}})()`
                }}
            />
        </head>
        <body>
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
        >
            <Navbar />
            {children}
        </ThemeProvider>
        </body>
        </html>
    );
}