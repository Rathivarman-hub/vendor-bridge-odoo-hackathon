import { formatDate } from '../utils/helpers'

export default function ApprovalTimeline({ steps = [] }) {
  if (!steps.length) return <p className="text-muted small">No approval steps yet.</p>
  return (
    <div className="timeline">
      {steps.map((step, i) => (
        <div key={i} className="timeline-item">
          <div className={`timeline-dot ${step.status}`} />
          <div className="ms-2">
            <div className="d-flex justify-content-between">
              <strong style={{ fontSize: '0.9rem' }}>{step.approverName || `Step ${i + 1}`}</strong>
              <span className="text-muted" style={{ fontSize: '0.78rem' }}>
                {step.actionDate ? formatDate(step.actionDate) : 'Pending'}
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: 0, textTransform: 'capitalize' }}>
              {step.status}{step.comment ? ` — ${step.comment}` : ''}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
