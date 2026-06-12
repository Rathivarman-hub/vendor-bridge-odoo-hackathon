import { useState, useEffect, useRef } from 'react'
import Layout from '../../components/layout/Layout'
import { getInvoiceById, sendInvoiceEmail } from '../../services/api'
import { formatDate, formatCurrency } from '../../utils/helpers'
import { useParams } from 'react-router-dom'
import Spinner from '../../components/common/Spinner'
import { useApp } from '../../context/AppContext'

const InvoiceDetail = () => {
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const { id } = useParams()
  const { addNotification } = useApp()
  const printRef = useRef()

  useEffect(() => {
    getInvoiceById(id).then(r => setInvoice(r.data)).catch(console.error).finally(() => setLoading(false))
  }, [id])

  const handlePrint = () => window.print()

  const handleSendEmail = async () => {
    try {
      await sendInvoiceEmail(id)
      addNotification('Invoice sent via email!', 'success')
    } catch { addNotification('Failed to send email', 'error') }
  }

  if (loading) return <Layout title="Invoice"><Spinner /></Layout>
  if (!invoice) return <Layout title="Invoice"><p className="text-muted">Invoice not found</p></Layout>

  return (
    <Layout title="Invoice Detail">
      <div className="page-header">
        <h4><i className="bi bi-receipt me-2 text-primary"></i>Invoice — {invoice.invoiceNumber}</h4>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary" onClick={handlePrint}><i className="bi bi-printer me-1"></i>Print</button>
        </div>
      </div>

      <div className="form-card" ref={printRef} id="invoice-print">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-start mb-4 pb-3 border-bottom">
          <div>
            <h4 className="fw-bold text-primary">VendorBridge ERP</h4>
            <p className="text-muted mb-0" style={{fontSize:'0.875rem'}}>Procurement & Vendor Management</p>
          </div>
          <div className="text-end">
            <h5 className="fw-bold">INVOICE</h5>
            <div style={{fontSize:'0.875rem'}}>
              <div><strong>Invoice No:</strong> {invoice.invoiceNumber}</div>
              <div><strong>Date:</strong> {formatDate(invoice.createdAt)}</div>
              <div><strong>PO No:</strong> {invoice.purchaseOrder?.poNumber}</div>
            </div>
          </div>
        </div>

        {/* Vendor Info */}
        <div className="row mb-4">
          <div className="col-md-6">
            <h6 className="fw-bold mb-2">Bill To:</h6>
            <div style={{fontSize:'0.875rem'}}>
              <div className="fw-semibold">{invoice.vendor?.name}</div>
              <div className="text-muted">{invoice.vendor?.email}</div>
              <div className="text-muted">{invoice.vendor?.phone}</div>
              <div className="text-muted">{invoice.vendor?.address}</div>
              {invoice.vendor?.gstNumber && <div><strong>GST:</strong> {invoice.vendor?.gstNumber}</div>}
            </div>
          </div>
        </div>

        {/* Items */}
        <table className="table table-bordered mb-4">
          <thead className="table-light">
            <tr><th>#</th><th>Description</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr>
          </thead>
          <tbody>
            {invoice.items?.map((item, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{item.description}</td>
                <td>{item.quantity}</td>
                <td>{formatCurrency(item.unitPrice)}</td>
                <td>{formatCurrency(item.total || item.quantity * item.unitPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="row justify-content-end">
          <div className="col-md-4">
            <table className="table table-sm">
              <tbody>
                <tr><td>Subtotal</td><td className="text-end">{formatCurrency(invoice.subTotal)}</td></tr>
                <tr><td>Tax ({invoice.taxPercent || 0}%)</td><td className="text-end">{formatCurrency(invoice.taxAmount)}</td></tr>
                <tr className="table-dark">
                  <td className="fw-bold">Total</td>
                  <td className="fw-bold text-end">{formatCurrency(invoice.totalAmount)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .topbar, .sidebar, .page-header, .btn, .theme-toggle { display: none !important; }
          .main-content { margin: 0 !important; padding: 0 !important; }
          .page-content { padding: 0 !important; }
          .form-card { 
            border: none !important; 
            padding: 0 !important; 
            background: white !important; 
            color: black !important;
            box-shadow: none !important;
          }
          .text-primary { color: #000 !important; }
          .text-muted { color: #555 !important; }
          .table { border-color: #ccc !important; color: black !important; }
          .table-light { background-color: #f8f9fa !important; color: black !important; }
          .table-dark { background-color: #343a40 !important; color: white !important; }
          body { background: white !important; color: black !important; }
        }
      `}</style>
    </Layout>
  )
}
export default InvoiceDetail
