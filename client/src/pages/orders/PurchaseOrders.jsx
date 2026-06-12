import { useState, useEffect } from 'react'
import Layout from '../../components/layout/Layout'
import { getPurchaseOrders } from '../../services/api'
import { formatDate, formatCurrency } from '../../utils/helpers'
import StatusBadge from '../../components/common/StatusBadge'
import Spinner from '../../components/common/Spinner'
import { Link } from 'react-router-dom'

const PurchaseOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPurchaseOrders().then(r => setOrders(r.data.orders ?? [])).catch(console.error).finally(() => setLoading(false))
  }, [])

  return (
    <Layout title="Purchase Orders">
      <div className="page-header">
        <h4><i className="bi bi-cart-check me-2 text-primary"></i>Purchase Orders</h4>
      </div>
      {loading ? <Spinner /> : (
        <div className="table-card">
          <table className="table table-hover">
            <thead>
              <tr><th>#</th><th>PO Number</th><th>Vendor</th><th>RFQ</th><th>Total Amount</th><th>Status</th><th>Created</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan="8" className="text-center text-muted py-4">No purchase orders</td></tr>
              ) : orders.map((o, i) => (
                <tr key={o._id}>
                  <td className="text-muted">{i + 1}</td>
                  <td><span className="badge badge-bg-light fw-semibold">{o.poNumber}</span></td>
                  <td>{o.vendor?.name || 'N/A'}</td>
                  <td>{o.rfq?.title || 'N/A'}</td>
                  <td className="fw-bold text-success">{formatCurrency(o.totalAmount)}</td>
                  <td><StatusBadge status={o.status} /></td>
                  <td>{formatDate(o.createdAt)}</td>
                  <td>
                    <Link to={`/purchase-orders/${o._id}`} className="btn btn-sm btn-outline-primary"><i className="bi bi-eye me-1"></i>View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  )
}
export default PurchaseOrders
