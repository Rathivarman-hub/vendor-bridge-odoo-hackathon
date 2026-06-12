import { getStatusBadge } from '../../utils/helpers'

const StatusBadge = ({ status }) => (
  <span className={`badge ${getStatusBadge(status)}`} style={{padding:'5px 10px',borderRadius:20,fontSize:'0.75rem'}}>
    {status?.charAt(0).toUpperCase() + status?.slice(1)}
  </span>
)
export default StatusBadge
