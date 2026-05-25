import { useMDXComponents as getDocsMDXComponents } from 'nextra-theme-docs'

export function useMDXComponents(
    components: Record<string, React.ComponentType> = {}
) {
    return {
        ...getDocsMDXComponents(),
        ...components
    }
}
