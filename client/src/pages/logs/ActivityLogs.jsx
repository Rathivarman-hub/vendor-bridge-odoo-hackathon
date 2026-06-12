import { useState, useEffect } from 'react'
import Layout from '../../components/layout/Layout'
import { getActivityLogs } from '../../services/api'
import { formatDate } from '../../utils/helpers'
import Spinner from '../../components/common/Spinner'

const iconMap = {
  rfq: { icon: 'bi-file-earmark-text', color: '#3b82f6' },
  quotation: { icon: 'bi-chat-quote', color: '#8b5cf6' },
  approval: { icon: 'bi-check2-circle', color: '#10b981' },
  purchase_order: { icon: 'bi-cart-check', color: '#f59e0b' },
  invoice: { icon: 'bi-receipt', color: '#ef4444' },
  vendor: { icon: 'bi-building', color: '#6366f1' },
}

const ActivityLogs = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    getActivityLogs({ type: filter }).then(r => setLogs(r.data.logs ?? [])).catch(console.error).finally(() => setLoading(false))
  }, [filter])

  return (
    <Layout title="Activity Logs">
      <div className="page-header">
        <h4><i className="bi bi-clock-history me-2 text-primary"></i>Activity Logs</h4>
      </div>
      <div className="form-card mb-4">
        <div className="d-flex gap-2 flex-wrap">
          {['', 'rfq', 'quotation', 'approval', 'purchase_order', 'invoice', 'vendor'].map(type => (
            <button key={type} className={`btn btn-sm ${filter === type ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setFilter(type)}>
              {type === '' ? 'All' : type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      {loading ? <Spinner /> : (
        <div className="form-card">
          <div className="timeline">
            {logs.length === 0 ? (
              <p className="text-muted text-center py-4">No activity logs found</p>
            ) : logs.map(log => {
              const meta = iconMap[log.type] || { icon: 'bi-activity', color: '#64748b' }
              return (
                <div key={log._id} className="timeline-item">
                  <div className="timeline-dot" style={{background: meta.color, boxShadow: `0 0 0 2px ${meta.color}`}}></div>
                  <div className="d-flex align-items-start gap-3 p-2 rounded" style={{background:'#f8fafc'}}>
                    <div className="d-flex align-items-center justify-content-center rounded-2" style={{width:36,height:36,background:meta.color+'20',color:meta.color,flexShrink:0}}>
                      <i className={`bi ${meta.icon}`}></i>
                    </div>
                    <div className="flex-grow-1">
                      <div className="fw-semibold" style={{fontSize:'0.875rem'}}>{log.message}</div>
                      <div className="text-muted" style={{fontSize:'0.75rem'}}>
                        <i className="bi bi-person me-1"></i>{log.user?.name || 'System'} &nbsp;·&nbsp;
                        <i className="bi bi-clock me-1"></i>{formatDate(log.createdAt)}
                      </div>
                    </div>
                    <span className="badge badge-bg-light" style={{fontSize:'0.7rem'}}>{log.type?.replace('_',' ')}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </Layout>
  )
}
export default ActivityLogs
