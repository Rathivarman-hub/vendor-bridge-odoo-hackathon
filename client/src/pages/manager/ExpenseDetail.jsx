import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import ExpenseStatusBadge from '../../components/ExpenseStatusBadge'
import ApprovalTimeline from '../../components/ApprovalTimeline'
import { getExpenseById, approveExpense, rejectExpense } from '../../services/api'
import { formatCurrency, formatDate } from '../../utils/helpers'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'

export default function ManagerExpenseDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [expense, setExpense] = useState(null)
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState('')
  const [actionType, setActionType] = useState('')

  const load = () => getExpenseById(id).then(r => setExpense(r.data.data)).finally(() => setLoading(false))
  useEffect(() => { load() }, [id])

  const handleAction = async () => {
    if (!comment.trim()) return toast.error('Comment required')
    try {
      if (actionType === 'approve') await approveExpense(id, { comment })
      else                          await rejectExpense(id, { comment })
      toast.success(`Expense ${actionType}d!`)
      setActionType(''); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  if (loading) return <Layout title="Expense Detail"><div className="text-center p-5"><div className="spinner-border text-primary"/></div></Layout>
  if (!expense) return <Layout title="Expense Detail"><div className="text-center p-5 text-muted">Not found</div></Layout>

  return (
    <Layout title="Expense Detail">
      <button className="btn btn-outline-secondary btn-sm mb-3" onClick={() => navigate(-1)}>
        <i className="bi bi-arrow-left me-1"/>Back
      </button>
      <div className="row g-3">
        <div className="col-lg-8">
          <div className="form-card mb-3">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <h5 className="mb-0 fw-semibold">{expense.description}</h5>
              <ExpenseStatusBadge status={expense.status}/>
            </div>
            <div className="row g-3">
              {[
                ['Employee', expense.employee?.name],
                ['Category', expense.category],
                ['Original Amount', formatCurrency(expense.amount, expense.currency)],
                ['In Company Currency', formatCurrency(expense.convertedAmount, user?.company?.currency)],
                ['Date', formatDate(expense.date)],
              ].map(([label, value]) => (
                <div key={label} className="col-sm-6">
                  <p className="text-muted small mb-1" style={{fontWeight:600}}>{label}</p>
                  <p className="mb-0 fw-semibold">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {(expense.status === 'pending' || expense.status === 'in_review') && (
            <div className="form-card">
              <h6 className="fw-semibold mb-3">Take Action</h6>
              {!actionType ? (
                <div className="d-flex gap-2">
                  <button className="btn btn-success" onClick={() => setActionType('approve')}>
                    <i className="bi bi-check-circle me-1"/>Approve
                  </button>
                  <button className="btn btn-danger" onClick={() => setActionType('reject')}>
                    <i className="bi bi-x-circle me-1"/>Reject
                  </button>
                </div>
              ) : (
                <div>
                  <label className="form-label">Comment <span className="text-danger">*</span></label>
                  <textarea className="form-control mb-2" rows={3} value={comment} onChange={e => setComment(e.target.value)} placeholder="Add comment..."/>
                  <button className={`btn btn-${actionType==='approve'?'success':'danger'} me-2`} onClick={handleAction}>
                    Confirm {actionType}
                  </button>
                  <button className="btn btn-outline-secondary" onClick={() => setActionType('')}>Cancel</button>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="col-lg-4">
          <div className="form-card">
            <h6 className="fw-semibold mb-3">Approval Timeline</h6>
            <ApprovalTimeline steps={expense.approvalSteps || []}/>
          </div>
        </div>
      </div>
    </Layout>
  )
}
