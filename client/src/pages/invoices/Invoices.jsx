import { useState, useEffect } from 'react'
import Layout from '../../components/layout/Layout'
import { getInvoices, sendInvoiceEmail, downloadInvoicePDF } from '../../services/api'
import { formatDate, formatCurrency } from '../../utils/helpers'
import StatusBadge from '../../components/common/StatusBadge'
import Spinner from '../../components/common/Spinner'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

const Invoices = () => {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const { addNotification } = useApp()
  const navigate = useNavigate()

  useEffect(() => {
    getInvoices().then(r => setInvoices(r.data.invoices ?? [])).catch(console.error).finally(() => setLoading(false))
  }, [])

  const handleSendEmail = async (id) => {
    try {
      await sendInvoiceEmail(id)
      addNotification('Invoice sent via email!', 'success')
    } catch { addNotification('Failed to send email', 'error') }
  }

  const handleDownloadPDF = async (id, invoiceNumber) => {
    try {
      const res = await downloadInvoicePDF(id)
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${invoiceNumber}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch { addNotification('Failed to download PDF', 'error') }
  }

  const handlePrint = (id) => navigate(`/invoices/${id}`)


  return (
    <Layout title="Invoices">
      <div className="page-header">
        <h4><i className="bi bi-receipt me-2 text-primary"></i>Invoices</h4>
      </div>
      {loading ? <Spinner /> : (
        <div className="table-card">
          <table className="table table-hover">
            <thead>
              <tr><th>#</th><th>Invoice No.</th><th>PO Number</th><th>Vendor</th><th>Subtotal</th><th>Tax</th><th>Total</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr><td colSpan="9" className="text-center text-muted py-4">No invoices found</td></tr>
              ) : invoices.map((inv, i) => (
                <tr key={inv._id}>
                  <td className="text-muted">{i + 1}</td>
                  <td><span className="badge badge-bg-light fw-semibold">{inv.invoiceNumber}</span></td>
                  <td>{inv.purchaseOrder?.poNumber || 'N/A'}</td>
                  <td>{inv.vendor?.name || 'N/A'}</td>
                  <td>{formatCurrency(inv.subTotal)}</td>
                  <td>{formatCurrency(inv.taxAmount)} ({inv.taxPercent || 0}%)</td>
                  <td className="fw-bold text-success">{formatCurrency(inv.totalAmount)}</td>
                  <td><StatusBadge status={inv.status} /></td>
                  <td>
                    <div className="d-flex gap-1 flex-wrap">
                      <Link to={`/invoices/${inv._id}`} className="btn btn-sm btn-outline-primary" title="View"><i className="bi bi-eye"></i></Link>
                      <button className="btn btn-sm btn-outline-secondary" title="Download PDF" onClick={() => handleDownloadPDF(inv._id, inv.invoiceNumber)}><i className="bi bi-download"></i></button>
                      <button className="btn btn-sm btn-outline-secondary" title="Print" onClick={() => handlePrint(inv._id)}><i className="bi bi-printer"></i></button>
                    </div>
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
export default Invoices
