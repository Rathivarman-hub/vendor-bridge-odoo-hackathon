import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import ExpenseStatusBadge from '../../components/ExpenseStatusBadge'
import { getPendingExpenses, approveExpense, rejectExpense } from '../../services/api'
import { formatCurrency, formatDate } from '../../utils/helpers'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'

export default function PendingApprovals() {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading]   = useState(true)
  const [comment, setComment]   = useState('')
  const [actionId, setActionId] = useState(null)
  const [actionType, setActionType] = useState('')
  const navigate = useNavigate()

  const load = () => getPendingExpenses().then(r => setExpenses(r.data.data || [])).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const openAction = (id, type) => { setActionId(id); setActionType(type); setComment('') }

  const handleAction = async () => {
    if (!comment.trim()) return toast.error('Comment is required')
    try {
      if (actionType === 'approve') await approveExpense(actionId, { comment })
      else                          await rejectExpense(actionId, { comment })
      toast.success(`Expense ${actionType}d!`)
      setActionId(null); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  return (
    <Layout title="Pending Approvals">
      <div className="table-card">
        <div className="table-responsive">
          {loading ? <div className="text-center p-5"><div className="spinner-border text-primary"/></div> : (
          <table className="table table-hover mb-0">
            <thead><tr><th>Employee</th><th>Category</th><th>Amount</th><th>Description</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {expenses.map(e => (
                <tr key={e._id}>
                  <td>{e.employee?.name}</td>
                  <td><span className="badge badge-bg-light">{e.category}</span></td>
                  <td>{formatCurrency(e.convertedAmount || e.amount, user?.company?.currency)}</td>
                  <td style={{maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{e.description}</td>
                  <td>{formatDate(e.date)}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-1" onClick={() => navigate(`/manager/expenses/${e._id}`)}>
                      <i className="bi bi-eye"/>
                    </button>
                    <button className="btn btn-sm btn-success me-1" onClick={() => openAction(e._id,'approve')}>
                      <i className="bi bi-check"/>
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => openAction(e._id,'reject')}>
                      <i className="bi bi-x"/>
                    </button>
                  </td>
                </tr>
              ))}
              {!expenses.length && <tr><td colSpan={6} className="text-center text-muted py-4">No pending approvals</td></tr>}
            </tbody>
          </table>
          )}
        </div>
      </div>

      {actionId && (
        <div className="modal show d-block" style={{background:'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" style={{textTransform:'capitalize'}}>{actionType} Expense</h5>
                <button className="btn-close" onClick={() => setActionId(null)}/>
              </div>
              <div className="modal-body">
                <label className="form-label">Comment <span className="text-danger">*</span></label>
                <textarea className="form-control" rows={3} placeholder="Add your comment..."
                  value={comment} onChange={e => setComment(e.target.value)} />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setActionId(null)}>Cancel</button>
                <button className={`btn btn-${actionType === 'approve' ? 'success' : 'danger'}`} onClick={handleAction}>
                  Confirm {actionType}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
