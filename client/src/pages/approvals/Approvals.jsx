import React, { useState, useEffect } from 'react'
import Layout from '../../components/layout/Layout'
import { getApprovals, approveRequest, rejectRequest, createPurchaseOrder } from '../../services/api'
import { formatDate, formatCurrency } from '../../utils/helpers'
import StatusBadge from '../../components/common/StatusBadge'
import Spinner from '../../components/common/Spinner'
import { useApp } from '../../context/AppContext'
import ApprovalTimeline from '../../components/ApprovalTimeline'
import { useNavigate } from 'react-router-dom'

const Approvals = () => {
  const [approvals, setApprovals] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState({ show: false, id: null, action: null })
  const [remarks, setRemarks] = useState('')
  const [expanded, setExpanded] = useState({})
  const { addNotification } = useApp()
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  
  const isProcurement = user?.role === 'admin' || user?.role === 'procurement_officer'

  const fetchApprovals = () => {
    getApprovals().then(r => setApprovals(r.data.approvals ?? [])).catch(console.error).finally(() => setLoading(false))
  }
  useEffect(() => { fetchApprovals() }, [])

  const handleAction = async () => {
    try {
      if (modal.action === 'approve') await approveRequest(modal.id, { remarks })
      else await rejectRequest(modal.id, { remarks })
      addNotification(`Request ${modal.action}d successfully!`, 'success')
      fetchApprovals()
    } catch { addNotification('Action failed', 'error') }
    setModal({ show: false, id: null, action: null })
    setRemarks('')
  }
  
  const handleGeneratePO = async (approvalId) => {
     try {
       await createPurchaseOrder({ approvalId })
       addNotification('Purchase Order generated successfully!', 'success')
       navigate('/purchase-orders')
     } catch (err) {
       addNotification(err.response?.data?.message || 'Failed to generate PO', 'error')
     }
  }

  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }))

  return (
    <Layout title="Approval Workflow">
      <div className="page-header">
        <h4><i className="bi bi-check2-circle me-2 text-primary"></i>Approval Workflow</h4>
      </div>

      {loading ? <Spinner /> : (
        <div className="table-card">
          <table className="table table-hover">
            <thead>
              <tr><th>#</th><th>RFQ</th><th>Vendor</th><th>Amount</th><th>Requested By</th><th>Status</th><th>Date</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {approvals.length === 0 ? (
                <tr><td colSpan="8" className="text-center text-muted py-4">No approval requests</td></tr>
              ) : approvals.map((a, i) => {
                const steps = [
                  { approverName: a.requestedBy?.name || 'System', actionDate: a.createdAt, status: 'requested', comment: 'Approval requested' }
                ]
                if (a.status !== 'pending') {
                  steps.push({ approverName: a.approvedBy?.name || 'Approver', actionDate: a.actionAt || a.updatedAt, status: a.status, comment: a.remarks })
                }
                const isExpanded = !!expanded[a._id]

                return (
                  <React.Fragment key={a._id}>
                    <tr>
                      <td className="text-muted">{i + 1}</td>
                      <td>
                        <button className="btn btn-link p-0 text-decoration-none fw-semibold" onClick={() => toggleExpand(a._id)}>
                          {isExpanded ? <i className="bi bi-chevron-down me-1"></i> : <i className="bi bi-chevron-right me-1"></i>}
                          {a.rfq?.title || 'N/A'}
                        </button>
                      </td>
                      <td>{a.vendor?.name || 'N/A'}</td>
                      <td className="fw-semibold">{formatCurrency(a.quotation?.totalAmount)}</td>
                      <td>{a.requestedBy?.name || 'N/A'}</td>
                      <td><StatusBadge status={a.status} /></td>
                      <td>{formatDate(a.createdAt)}</td>
                      <td>
                        {a.status === 'pending' ? (
                          <div className="d-flex gap-1">
                            <button className="btn btn-sm btn-success" onClick={() => setModal({ show: true, id: a._id, action: 'approve' })}>
                              <i className="bi bi-check-lg me-1"></i>Approve
                            </button>
                            <button className="btn btn-sm btn-danger" onClick={() => setModal({ show: true, id: a._id, action: 'reject' })}>
                              <i className="bi bi-x-lg me-1"></i>Reject
                            </button>
                          </div>
                        ) : a.status === 'approved' && isProcurement ? (
                           <button className="btn btn-sm btn-primary" onClick={() => handleGeneratePO(a._id)}>
                             <i className="bi bi-cart-plus me-1"></i>Generate PO
                           </button>
                        ) : (
                          <span className="text-muted" style={{fontSize:'0.8rem'}}>{a.remarks || 'No remarks'}</span>
                        )}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan="8" className="bg-light p-3 border-bottom">
                          <div className="ps-4">
                            <h6 className="fw-bold fs-6 mb-3">Approval Timeline</h6>
                            <ApprovalTimeline steps={steps} />
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Action Modal */}
      {modal.show && (
        <div className="modal show d-block" style={{background:'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {modal.action === 'approve' ? '✅ Approve Request' : '❌ Reject Request'}
                </h5>
                <button className="btn-close" onClick={() => setModal({ show: false, id: null, action: null })}></button>
              </div>
              <div className="modal-body">
                <label className="form-label">Remarks (optional)</label>
                <textarea className="form-control" rows={3} value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Add your remarks here..."></textarea>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setModal({ show: false, id: null, action: null })}>Cancel</button>
                <button className={`btn ${modal.action === 'approve' ? 'btn-success' : 'btn-danger'}`} onClick={handleAction}>
                  {modal.action === 'approve' ? 'Approve' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
export default Approvals

