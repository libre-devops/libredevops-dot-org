'use client'

import { useState, useRef } from 'react'
import { Check, Copy } from 'lucide-react'

const LANG_LABELS: Record<string, string> = {
    hcl:        'HCL',
    tf:         'Terraform',
    terraform:  'Terraform',
    bash:       'Bash',
    sh:         'Shell',
    zsh:        'Zsh',
    powershell: 'PowerShell',
    ps1:        'PowerShell',
    python:     'Python',
    py:         'Python',
    typescript: 'TypeScript',
    ts:         'TypeScript',
    javascript: 'JavaScript',
    js:         'JavaScript',
    json:       'JSON',
    yaml:       'YAML',
    yml:        'YAML',
    toml:       'TOML',
    go:         'Go',
    rust:       'Rust',
    sql:        'SQL',
    dockerfile: 'Dockerfile',
    text:       'TEXT',
    txt:        'TEXT',
    xml:        'XML',
    html:       'HTML',
    css:        'CSS',
}

interface PreProps extends React.HTMLAttributes<HTMLPreElement> {
    'data-language'?: string
    children?: React.ReactNode
}

export function CodeBlock({ children, 'data-language': lang, ...props }: PreProps) {
    const [copied, setCopied] = useState(false)
    const preRef = useRef<HTMLPreElement>(null)

    const copy = async () => {
        const text = preRef.current?.textContent ?? ''
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const label = lang ? (LANG_LABELS[lang.toLowerCase()] ?? lang.toUpperCase()) : null

    return (
        <div className="cb-wrapper">
            <div className="cb-header">
                <div className="cb-dots" aria-hidden>
                    <span className="cb-dot cb-dot--red" />
                    <span className="cb-dot cb-dot--yellow" />
                    <span className="cb-dot cb-dot--green" />
                </div>
                {label && <span className="cb-lang">{label}</span>}
                <button onClick={copy} className="cb-copy" aria-label="Copy code">
                    {copied
                        ? <Check size={13} strokeWidth={2.5} />
                        : <Copy size={13} strokeWidth={2} />
                    }
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
            </div>
            <pre ref={preRef} {...props} className={`cb-pre${props.className ? ' ' + props.className : ''}`}>
                {children}
            </pre>
        </div>
    )
}
