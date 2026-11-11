import LoadingSpinner from './LoadingSpinner'

export default function DataTable({ columns = [], rows = [], loading = false, empty = 'No data found.' }) {
  if (loading) {
    return (
      <div className="rounded-xl overflow-hidden"
        style={{ background: '#151522', border: '1px solid rgba(139,92,246,0.1)' }}>
        <LoadingSpinner label="Loading..." />
      </div>
    )
  }

  return (
    <div className="rounded-xl overflow-auto"
      style={{ background: '#151522', border: '1px solid rgba(139,92,246,0.1)' }}>
      <table className="w-full text-sm min-w-max">
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(139,92,246,0.1)', background: '#10101A' }}>
            {columns.map(col => (
              <th key={col.key}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                style={{ color: '#9292A5' }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-sm"
                style={{ color: '#9292A5' }}>
                {empty}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={row.id ?? i}
                style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', background: i % 2 === 1 ? 'rgba(139,92,246,0.02)' : 'transparent' }}
                className="transition-colors hover:bg-white/[0.015]">
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-3 text-white">
                    {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
