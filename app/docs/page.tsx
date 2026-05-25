import { importPage } from 'nextra/pages'
import { useMDXComponents } from 'nextra-theme-docs'

// importPage resolves from the content root, so ['docs'] → content/docs/index.mdx
export async function generateMetadata() {
    const { metadata } = await importPage(['docs'])
    return metadata
}

export default async function DocsPage() {
    const result = await importPage(['docs'])
    const { default: MDXContent, toc, metadata, ...rest } = result
    const { wrapper: Wrapper } = useMDXComponents()
    return (
        <Wrapper toc={toc} metadata={metadata} {...rest}>
            <MDXContent />
        </Wrapper>
    )
}
