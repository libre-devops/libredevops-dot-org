import { importPage } from 'nextra/pages'
import { getPageMap } from 'nextra/page-map'
import { useMDXComponents } from 'nextra-theme-docs'

type PageMapItem = {
    route?: string
    children?: PageMapItem[]
}

function collectSegments(items: PageMapItem[], out: string[][] = []): string[][] {
    for (const item of items) {
        if (item.route) {
            // Strip /docs/ prefix - params are relative to the catch-all base
            const rel = item.route.replace(/^\/docs\/?/, '').split('/').filter(Boolean)
            if (rel.length > 0) out.push(rel)
        }
        if (item.children) collectSegments(item.children, out)
    }
    return out
}

// Build static params from the page map, scoped to /docs
export async function generateStaticParams() {
    const pageMap = await getPageMap('/docs')
    return collectSegments(pageMap as PageMapItem[]).map(mdxPath => ({ mdxPath }))
}

export async function generateMetadata(props: {
    params: Promise<{ mdxPath: string[] }>
}) {
    const params = await props.params
    // Prepend 'docs' so importPage resolves from the content root
    const { metadata } = await importPage(['docs', ...params.mdxPath])
    return metadata
}

export default async function Page(props: {
    params: Promise<{ mdxPath: string[] }>
}) {
    const params = await props.params
    const result = await importPage(['docs', ...params.mdxPath])
    const { default: MDXContent, toc, metadata, ...rest } = result
    const { wrapper: Wrapper } = useMDXComponents()
    return (
        <Wrapper toc={toc} metadata={metadata} {...rest}>
            <MDXContent {...props} params={params} />
        </Wrapper>
    )
}
