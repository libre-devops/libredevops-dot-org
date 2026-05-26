import { Layout } from 'nextra-theme-docs'
import { getPageMap } from 'nextra/page-map'

import 'nextra-theme-docs/style.css'

import { DocsChangeButton } from '@/components/docs-change-button'
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
            footer={
                <div key="docs-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        Libre DevOps
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
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
