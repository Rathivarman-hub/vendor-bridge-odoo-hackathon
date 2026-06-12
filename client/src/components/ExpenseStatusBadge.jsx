import { getStatusBadge, getStatusLabel } from '../utils/helpers'

export default function ExpenseStatusBadge({ status }) {
  return (
    <span className={`badge ${getStatusBadge(status)}`} style={{ padding: '0.4em 0.8em', borderRadius: 6, fontWeight: 600, fontSize: '0.75rem' }}>
      {getStatusLabel(status)}
    </span>
  )
}
