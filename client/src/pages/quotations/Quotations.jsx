import { useState, useEffect } from 'react'
import Layout from '../../components/layout/Layout'
import { getQuotations, createApproval } from '../../services/api'
import { formatDate, formatCurrency } from '../../utils/helpers'
import StatusBadge from '../../components/common/StatusBadge'
import Spinner from '../../components/common/Spinner'
import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

const Quotations = () => {
  const [quotations, setQuotations] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [submitting, setSubmitting] = useState(null)
  const [confirmId, setConfirmId] = useState(null)
  const { addNotification } = useApp()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const canSubmitApproval = user?.role === 'admin' || user?.role === 'procurement_officer'

  const fetchQuotations = () => {
    setLoading(true)
    getQuotations({ search })
      .then(r => setQuotations(r.data.quotations ?? []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchQuotations() }, [search])

  const handleSubmitApproval = async (quotationId) => {
    setConfirmId(null)
    setSubmitting(quotationId)
    try {
      await createApproval({ quotationId })
      addNotification('Approval request submitted successfully!', 'success')
      fetchQuotations()
    } catch (err) {
      addNotification(err.response?.data?.message || 'Failed to submit approval', 'error')
    } finally {
      setSubmitting(null)
    }
  }

  return (
    <Layout title="Quotations">
      <div className="page-header">
        <h4><i className="bi bi-chat-quote me-2 text-primary"></i>Vendor Quotations</h4>
        <Link to="/quotations/new" className="btn btn-primary"><i className="bi bi-plus me-1"></i>Submit Quotation</Link>
      </div>
      <div className="table-card mb-4 p-3">
        <div className="input-group" style={{maxWidth:400}}>
          <span className="input-group-text bg-white"><i className="bi bi-search text-muted"></i></span>
          <input type="text" className="form-control border-start-0" placeholder="Search quotations..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>
      {loading ? <Spinner /> : (
        <div className="table-card">
          <table className="table table-hover">
            <thead>
              <tr><th>#</th><th>RFQ</th><th>Vendor</th><th>Total Amount</th><th>Delivery Days</th><th>Status</th><th>Submitted</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {quotations.length === 0 ? (
                <tr><td colSpan="8" className="text-center text-muted py-4">No quotations found</td></tr>
              ) : quotations.map((q, i) => (
                <tr key={q._id}>
                  <td className="text-muted">{i + 1}</td>
                  <td><div className="fw-semibold">{q.rfq?.title || 'N/A'}</div></td>
                  <td>{q.vendor?.name || 'N/A'}</td>
                  <td className="fw-semibold text-success">{formatCurrency(q.totalAmount)}</td>
                  <td>{q.deliveryDays} days</td>
                  <td><StatusBadge status={q.status} /></td>
                  <td>{formatDate(q.createdAt)}</td>
                  <td>
                    <div className="d-flex gap-1">
                      <Link to={`/quotations/${q._id}`} className="btn btn-sm btn-outline-primary">
                        <i className="bi bi-eye"></i>
                      </Link>
                      {canSubmitApproval && (q.status === 'submitted' || q.status === 'under_review') && (
                        <button
                          className="btn btn-sm btn-outline-warning"
                          title="Submit for Approval"
                          disabled={submitting === q._id}
                          onClick={() => setConfirmId(q._id)}
                        >
                          {submitting === q._id
                            ? <span className="spinner-border spinner-border-sm"></span>
                            : <><i className="bi bi-send me-1"></i>Approve</>
                          }
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirm Submit Modal */}
      {confirmId && (
        <div className="modal show d-block" style={{background:'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title"><i className="bi bi-send me-2 text-warning"></i>Submit for Approval</h5>
                <button className="btn-close" onClick={() => setConfirmId(null)}></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to submit this quotation for manager approval?</p>
                <p className="text-muted small mb-0">This will notify the manager and cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setConfirmId(null)}>Cancel</button>
                <button className="btn btn-warning" onClick={() => handleSubmitApproval(confirmId)}>
                  <i className="bi bi-send me-1"></i>Submit for Approval
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
export default Quotations

