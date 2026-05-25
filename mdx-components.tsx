import { useMDXComponents as getDocsMDXComponents } from 'nextra-theme-docs'
import { CodeBlock } from '@/components/code-block'

export function useMDXComponents(
    components: Record<string, React.ComponentType> = {}
) {
    return {
        ...getDocsMDXComponents(),
        pre: CodeBlock as React.ComponentType,
        ...components
    }
}
