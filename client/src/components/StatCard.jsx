export default function StatCard({ title, value, icon, color, sub }) {
  const colors = {
    primary: { bg: '#ede9fe', color: '#4f46e5' },
    success: { bg: '#d1fae5', color: '#059669' },
    warning: { bg: '#fef3c7', color: '#d97706' },
    danger:  { bg: '#fee2e2', color: '#dc2626' },
    info:    { bg: '#dbeafe', color: '#2563eb' },
  }
  const c = colors[color] || colors.primary
  return (
    <div className="stat-card h-100">
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</p>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>{value}</h3>
          {sub && <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>{sub}</p>}
        </div>
        <div className="stat-icon" style={{ background: c.bg, color: c.color }}>
          <i className={`bi ${icon}`} />
        </div>
      </div>
    </div>
  )
}
