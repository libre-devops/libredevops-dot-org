export interface AzureResource {
    asset: string;
    namespace: string;
    abbr: string;
    position: string;
    entropy: string;
    length: string;
    construct: string;
    example: string;
    note?: string;
}

export interface OtherResource {
    asset: string;
    abbr: string;
    position: string;
    entropy: string;
    length: string;
    construct: string;
    example: string;
}

export function AzureResourceTable({ rows }: { rows: AzureResource[] }) {
    const hasNotes = rows.some(r => r.note);

    return (
        <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <thead>
                    <tr>
                        <th style={{ textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid var(--border-color, #333)', whiteSpace: 'nowrap' }}>Asset type</th>
                        <th style={{ textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid var(--border-color, #333)', whiteSpace: 'nowrap' }}>Namespace</th>
                        <th style={{ textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid var(--border-color, #333)', whiteSpace: 'nowrap' }}>Abbreviation</th>
                        <th style={{ textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid var(--border-color, #333)', whiteSpace: 'nowrap' }}>Position</th>
                        <th style={{ textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid var(--border-color, #333)', whiteSpace: 'nowrap' }}>Entropy</th>
                        <th style={{ textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid var(--border-color, #333)', whiteSpace: 'nowrap' }}>Length</th>
                        <th style={{ textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid var(--border-color, #333)', whiteSpace: 'nowrap' }}>Construct</th>
                        <th style={{ textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid var(--border-color, #333)', whiteSpace: 'nowrap' }}>Example</th>
                        {hasNotes && <th style={{ textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid var(--border-color, #333)', whiteSpace: 'nowrap' }}>Note</th>}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border-color, #222)' }}>
                            <td style={{ padding: '4px 8px' }}>{r.asset}</td>
                            <td style={{ padding: '4px 8px' }}><code style={{ fontSize: '0.75rem' }}>{r.namespace}</code></td>
                            <td style={{ padding: '4px 8px' }}><code style={{ fontSize: '0.75rem' }}>{r.abbr}</code></td>
                            <td style={{ padding: '4px 8px' }}>{r.position}</td>
                            <td style={{ padding: '4px 8px' }}>{r.entropy}</td>
                            <td style={{ padding: '4px 8px' }}>{r.length}</td>
                            <td style={{ padding: '4px 8px' }}><code style={{ fontSize: '0.75rem' }}>{r.construct}</code></td>
                            <td style={{ padding: '4px 8px' }}><code style={{ fontSize: '0.75rem' }}>{r.example}</code></td>
                            {hasNotes && <td style={{ padding: '4px 8px', fontSize: '0.75rem', fontStyle: 'italic', color: 'var(--text-muted, #666)' }}>{r.note}</td>}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export function OtherResourceTable({ rows }: { rows: OtherResource[] }) {
    return (
        <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <thead>
                    <tr>
                        <th style={{ textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid var(--border-color, #333)', whiteSpace: 'nowrap' }}>Asset type</th>
                        <th style={{ textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid var(--border-color, #333)', whiteSpace: 'nowrap' }}>Abbreviation</th>
                        <th style={{ textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid var(--border-color, #333)', whiteSpace: 'nowrap' }}>Position</th>
                        <th style={{ textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid var(--border-color, #333)', whiteSpace: 'nowrap' }}>Entropy</th>
                        <th style={{ textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid var(--border-color, #333)', whiteSpace: 'nowrap' }}>Length</th>
                        <th style={{ textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid var(--border-color, #333)', whiteSpace: 'nowrap' }}>Construct</th>
                        <th style={{ textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid var(--border-color, #333)', whiteSpace: 'nowrap' }}>Example</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border-color, #222)' }}>
                            <td style={{ padding: '4px 8px' }}>{r.asset}</td>
                            <td style={{ padding: '4px 8px' }}><code style={{ fontSize: '0.75rem' }}>{r.abbr}</code></td>
                            <td style={{ padding: '4px 8px' }}>{r.position}</td>
                            <td style={{ padding: '4px 8px' }}>{r.entropy}</td>
                            <td style={{ padding: '4px 8px' }}>{r.length}</td>
                            <td style={{ padding: '4px 8px' }}><code style={{ fontSize: '0.75rem' }}>{r.construct}</code></td>
                            <td style={{ padding: '4px 8px' }}><code style={{ fontSize: '0.75rem' }}>{r.example}</code></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
