import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import { getPurchaseOrderById, createInvoice } from '../../services/api'
import { formatDate, formatCurrency } from '../../utils/helpers'
import StatusBadge from '../../components/common/StatusBadge'
import Spinner from '../../components/common/Spinner'
import { useApp } from '../../context/AppContext'

const PurchaseOrderDetail = () => {
  const { id } = useParams()
  const [po, setPo] = useState(null)
  const [loading, setLoading] = useState(true)
  const { addNotification } = useApp()
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const isProcurement = user?.role === 'admin' || user?.role === 'procurement_officer'

  useEffect(() => {
    getPurchaseOrderById(id)
      .then(res => setPo(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  const handleGenerateInvoice = async () => {
    try {
      const { data } = await createInvoice({ purchaseOrderId: po._id })
      addNotification('Invoice generated successfully!', 'success')
      navigate(`/invoices/${data._id}`)
    } catch (err) {
      addNotification(err.response?.data?.message || 'Failed to generate invoice', 'error')
    }
  }

  if (loading) return <Layout title="Purchase Order"><Spinner /></Layout>

  if (!po) return (
    <Layout title="Purchase Order Detail">
      <div className="text-center py-5">
        <h4 className="text-muted">Purchase Order not found</h4>
        <Link to="/purchase-orders" className="btn btn-primary mt-3">Back to List</Link>
      </div>
    </Layout>
  )

  return (
    <Layout title={`Purchase Order: ${po.poNumber}`}>
      <div className="page-header justify-content-between">
        <div className="d-flex align-items-center gap-3">
          <h4><i className="bi bi-cart-check me-2 text-primary"></i>{po.poNumber}</h4>
          <StatusBadge status={po.status} />
        </div>
        <div className="d-flex gap-2">
          {isProcurement && (
            <button className="btn btn-success" onClick={handleGenerateInvoice}>
              <i className="bi bi-receipt me-1"></i>Generate Invoice
            </button>
          )}
          <Link to="/purchase-orders" className="btn btn-outline-secondary">
            <i className="bi bi-arrow-left me-1"></i>Back
          </Link>
        </div>
      </div>

      <div className="row g-4">
         <div className="col-md-6">
          <div className="stat-card h-100">
            <h6 className="fw-bold border-bottom pb-2 mb-3">Vendor Details</h6>
            {po.vendor && (
              <>
                <div className="fw-bold">{po.vendor.name}</div>
                <div className="text-muted">{po.vendor.address}</div>
                <div className="text-muted">Email: {po.vendor.email}</div>
                <div className="text-muted">Phone: {po.vendor.phone}</div>
                <div className="text-muted mt-2">GST No: {po.vendor.gstNumber || 'N/A'}</div>
              </>
            )}
          </div>
        </div>

        <div className="col-md-6">
          <div className="stat-card h-100">
            <h6 className="fw-bold border-bottom pb-2 mb-3">Order Information</h6>
            <table className="table table-borderless table-sm mb-0">
              <tbody>
                <tr><td className="text-muted w-50">RFQ Reference:</td><td className="fw-semibold">{po.rfq?.rfqNumber || 'N/A'}</td></tr>
                <tr><td className="text-muted">Delivery Date:</td><td>{po.deliveryDate ? formatDate(po.deliveryDate) : 'N/A'}</td></tr>
                <tr><td className="text-muted">Created By:</td><td>{po.createdBy?.name || 'N/A'}</td></tr>
                <tr><td className="text-muted">Created On:</td><td>{formatDate(po.createdAt)}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="table-card mt-4">
        <div className="p-3 border-bottom">
           <h6 className="fw-bold mb-0">Order Items</h6>
        </div>
        <table className="table">
          <thead className="table-light">
            <tr>
              <th>Description</th>
              <th className="text-center">Quantity</th>
              <th className="text-end">Unit Price</th>
              <th className="text-end">Total</th>
            </tr>
          </thead>
          <tbody>
            {(po.items || []).map((item, i) => (
              <tr key={i}>
                <td>{item.description}</td>
                <td className="text-center">{item.quantity}</td>
                <td className="text-end">{formatCurrency(item.unitPrice)}</td>
                <td className="text-end fw-semibold">{formatCurrency(item.total || item.quantity * item.unitPrice)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-top">
            <tr>
              <td colSpan="3" className="text-end text-muted">Sub Total:</td>
              <td className="text-end fw-bold">{formatCurrency(po.subTotal)}</td>
            </tr>
            <tr>
              <td colSpan="3" className="text-end text-muted">Tax ({po.taxPercent}%):</td>
              <td className="text-end text-danger">+{formatCurrency(po.taxAmount)}</td>
            </tr>
            <tr className="table-light">
              <td colSpan="3" className="text-end fw-bold font-monospace fs-6">Grand Total:</td>
              <td className="text-end fw-bold font-monospace fs-6 text-primary">{formatCurrency(po.totalAmount)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {po.notes && (
        <div className="form-card mt-4">
          <h6 className="fw-bold mb-2">Notes</h6>
          <p className="text-muted mb-0">{po.notes}</p>
        </div>
      )}
    </Layout>
  )
}

export default PurchaseOrderDetail

