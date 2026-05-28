import { Layout, Navbar } from 'nextra-theme-docs'
import { getPageMap } from 'nextra/page-map'

import 'nextra-theme-docs/style.css'

import { DocsChangeButton } from '@/components/docs-change-button'
import { DocsLogo } from '@/components/docs-logo'
import { NavbarToggle } from '@/components/navbar-toggle'
import { PrintButton } from '@/components/print-button'

export default async function DocsLayout({
    children
}: {
    children: React.ReactNode
}) {
    const pageMap = await getPageMap('/docs')
    return (
        <Layout
            pageMap={pageMap}
            docsRepositoryBase="https://github.com/libre-devops/libredevops-dot-org/tree/main"
            navbar={
                <Navbar
                    logo={<DocsLogo />}
                    projectLink="https://github.com/libre-devops"
                />
            }
            footer={
                <div key="docs-footer" className="docs-footer">
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        Libre DevOps
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <NavbarToggle />
                        <PrintButton />
                        <DocsChangeButton />
                    </div>
                </div>
            }
            nextThemes={{
                attribute: 'class',
                defaultTheme: 'dark',
                disableTransitionOnChange: false
            }}
        >
            {children}
        </Layout>
    )
}
