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