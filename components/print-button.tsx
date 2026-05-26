'use client'

import { Printer } from 'lucide-react'

export function PrintButton() {
    return (
        <span className="print-btn-wrapper">
            <button
                onClick={() => window.print()}
                className="docs-change-btn"
                aria-label="Print or export as PDF"
            >
                <Printer size={14} />
                Export PDF
            </button>
        </span>
    )
}
