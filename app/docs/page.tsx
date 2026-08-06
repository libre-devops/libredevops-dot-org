import { importPage } from 'nextra/pages'
// Aliased on import: this is a nextra factory, not a React hook. Under the
// use* name react-hooks/rules-of-hooks rejects it inside an async component.
import { useMDXComponents as getMDXComponents } from 'nextra-theme-docs'

// importPage resolves from the content root, so ['docs'] → content/docs/index.mdx
export async function generateMetadata() {
    const { metadata } = await importPage(['docs'])
    return metadata
}

export default async function DocsPage() {
    const result = await importPage(['docs'])
    const { default: MDXContent, toc, metadata, ...rest } = result
    const { wrapper: Wrapper } = getMDXComponents()
    return (
        <Wrapper toc={toc} metadata={metadata} {...rest}>
            <MDXContent />
        </Wrapper>
    )
}
