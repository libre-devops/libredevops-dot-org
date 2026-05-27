import './globals.css';
import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';

import { Navbar } from '@/components/navbar';

export const metadata: Metadata = {
    title: 'Libre DevOps',
    description:
        'Platform engineering, DevOps and security engineering.',
    metadataBase: new URL('https://libredevops.org'),
    icons: {
        icon: '/assets/libre-devops-favicon.png',
        apple: '/assets/libre-devops-favicon.png'
    }
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