import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import ExpenseStatusBadge from '../../components/ExpenseStatusBadge'
import ApprovalTimeline from '../../components/ApprovalTimeline'
import { getExpenseById, overrideExpense } from '../../services/api'
import { formatCurrency, formatDate } from '../../utils/helpers'
import { toast } from 'react-toastify'

export default function ExpenseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [expense, setExpense] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getExpenseById(id).then(r => setExpense(r.data.data)).finally(() => setLoading(false))
  }, [id])

  const handleOverride = async (action) => {
    const comment = prompt(`Reason for ${action}?`)
    if (!comment) return
    try {
      await overrideExpense(id, { action, comment })
      toast.success(`Expense ${action}d`)
      getExpenseById(id).then(r => setExpense(r.data.data))
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  if (loading) return <Layout title="Expense Detail"><div className="text-center p-5"><div className="spinner-border text-primary"/></div></Layout>
  if (!expense) return <Layout title="Expense Detail"><div className="text-center p-5 text-muted">Expense not found</div></Layout>

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
              <ExpenseStatusBadge status={expense.status} />
            </div>
            <div className="row g-3">
              {[
                ['Employee', expense.employee?.name],
                ['Category', expense.category],
                ['Amount', formatCurrency(expense.amount, expense.currency)],
                ['Company Currency', formatCurrency(expense.convertedAmount, expense.companyCurrency)],
                ['Date', formatDate(expense.date)],
                ['Exchange Rate', expense.exchangeRate ? `1 ${expense.currency} = ${expense.exchangeRate} ${expense.companyCurrency}` : 'N/A'],
              ].map(([label, value]) => (
                <div key={label} className="col-sm-6">
                  <p className="text-muted small mb-1" style={{fontWeight:600}}>{label}</p>
                  <p className="mb-0 fw-semibold">{value}</p>
                </div>
              ))}
            </div>
            {expense.receiptUrl && (
              <div className="mt-3">
                <p className="text-muted small mb-1" style={{fontWeight:600}}>Receipt</p>
                <a href={expense.receiptUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-primary">
                  <i className="bi bi-file-earmark me-1"/>View Receipt
                </a>
              </div>
            )}
          </div>

          {(expense.status === 'pending' || expense.status === 'in_review') && (
            <div className="form-card">
              <h6 className="fw-semibold mb-3">Admin Override</h6>
              <div className="d-flex gap-2">
                <button className="btn btn-success" onClick={() => handleOverride('approve')}>
                  <i className="bi bi-check-circle me-1"/>Approve
                </button>
                <button className="btn btn-danger" onClick={() => handleOverride('reject')}>
                  <i className="bi bi-x-circle me-1"/>Reject
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="col-lg-4">
          <div className="form-card">
            <h6 className="fw-semibold mb-3">Approval Timeline</h6>
            <ApprovalTimeline steps={expense.approvalSteps || []} />
          </div>
        </div>
      </div>
    </Layout>
  )
}
