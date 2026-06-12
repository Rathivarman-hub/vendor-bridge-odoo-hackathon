import { useState, useEffect } from 'react'
import Layout from '../../components/layout/Layout'
import { createQuotation, getRFQs, getVendors, getQuotationById, updateQuotation } from '../../services/api'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'

const QuotationForm = () => {
  const [form, setForm] = useState({ rfq: '', vendor: '', items: [], deliveryDays: 7, notes: '', totalAmount: 0 })
  const [rfqs, setRFQs] = useState([])
  const [vendors, setVendors] = useState([])
  const [selectedRFQ, setSelectedRFQ] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const { id } = useParams()
  const navigate = useNavigate()
  const { addNotification } = useApp()
  const { user } = useAuth()
  const isEdit = !!id
  const isVendorRole = user?.role === 'vendor'

  useEffect(() => {
    getRFQs().then(r => setRFQs(r.data.rfqs ?? [])).catch(console.error)
    if (!isVendorRole) {
      // Only non-vendors need to pick a vendor from the dropdown
      getVendors().then(r => setVendors(r.data.vendors ?? [])).catch(console.error)
    }
    if (isEdit) getQuotationById(id).then(r => { setForm(r.data); setSelectedRFQ(r.data.rfq) }).catch(console.error)
  }, [id])

  // Auto-fill vendor field for vendor-role users using their linked vendorProfile
  useEffect(() => {
    if (isVendorRole && user?.vendorProfile && !isEdit) {
      setForm(prev => ({ ...prev, vendor: user.vendorProfile }))
    }
  }, [user, isVendorRole, isEdit])

  // For vendor users with no pre-linked profile, fetch vendors so they can pick their own
  useEffect(() => {
    if (isVendorRole && !user?.vendorProfile) {
      getVendors().then(r => setVendors(r.data.vendors ?? [])).catch(console.error)
    }
  }, [isVendorRole, user])

  const handleRFQChange = (e) => {
    const rfq = rfqs.find(r => r._id === e.target.value)
    setSelectedRFQ(rfq)
    const items = rfq?.items?.map(item => ({ description: item.description, quantity: item.quantity, unitPrice: 0, totalPrice: 0 })) || []
    setForm({ ...form, rfq: e.target.value, items })
  }

  const handleItemPriceChange = (i, price) => {
    const items = [...form.items]
    items[i].unitPrice = parseFloat(price) || 0
    items[i].totalPrice = items[i].unitPrice * items[i].quantity
    const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0)
    setForm({ ...form, items, totalAmount })
  }

  const validate = () => {
    const e = {}
    if (!form.rfq) e.rfq = 'Please select an RFQ'
    if (!form.vendor) e.vendor = 'Please select a vendor'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    try {
      setLoading(true)
      if (isEdit) await updateQuotation(id, form)
      else await createQuotation(form)
      addNotification('Quotation submitted!', 'success')
      navigate('/quotations')
    } catch (err) {
      addNotification(err.response?.data?.message || 'Failed to submit', 'error')
    } finally { setLoading(false) }
  }

  // Find the vendor name to display when auto-filled
  const autoVendorName = isVendorRole && user?.vendorProfile
    ? vendors.find(v => v._id === user.vendorProfile)?.name
    : null

  return (
    <Layout title="Submit Quotation">
      <div className="page-header">
        <h4><i className="bi bi-chat-quote me-2 text-primary"></i>Submit Quotation</h4>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-card mb-3">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">RFQ *</label>
              <select className={`form-select ${errors.rfq ? 'is-invalid' : ''}`} value={form.rfq} onChange={handleRFQChange}>
                <option value="">Select RFQ...</option>
                {rfqs.map(r => <option key={r._id} value={r._id}>{r.rfqNumber ? `${r.rfqNumber} — ` : ''}{r.title}</option>)}
              </select>
              {errors.rfq && <div className="invalid-feedback">{errors.rfq}</div>}
            </div>
            <div className="col-md-6">
              <label className="form-label">Vendor *</label>
              {/* Vendor users: show read-only field or a select if no profile linked */}
              {isVendorRole && user?.vendorProfile ? (
                <input
                  className="form-control"
                  value={autoVendorName || 'Your Vendor Profile'}
                  readOnly
                  style={{ background: 'var(--surface-2)', cursor: 'not-allowed' }}
                />
              ) : (
                <select className={`form-select ${errors.vendor ? 'is-invalid' : ''}`} value={form.vendor} onChange={e => setForm({ ...form, vendor: e.target.value })}>
                  <option value="">Select Vendor...</option>
                  {vendors.map(v => <option key={v._id} value={v._id}>{v.name}</option>)}
                </select>
              )}
              {errors.vendor && <div className="invalid-feedback">{errors.vendor}</div>}
            </div>
            <div className="col-md-3">
              <label className="form-label">Delivery Days</label>
              <input type="number" min="1" className="form-control" value={form.deliveryDays} onChange={e => setForm({ ...form, deliveryDays: e.target.value })} />
            </div>
            <div className="col-md-9">
              <label className="form-label">Notes / Comments</label>
              <input className="form-control" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
        </div>

        {form.items.length > 0 && (
          <div className="form-card mb-3">
            <h6 className="fw-bold mb-3">Pricing Details</h6>
            <table className="table">
              <thead>
                <tr><th>Item</th><th>Qty</th><th>Unit</th><th>Unit Price (₹)</th><th>Total (₹)</th></tr>
              </thead>
              <tbody>
                {form.items.map((item, i) => (
                  <tr key={i}>
                    <td>{item.description}</td>
                    <td>{item.quantity}</td>
                    <td>{item.unit || 'pcs'}</td>
                    <td><input type="number" min="0" step="0.01" className="form-control form-control-sm" style={{width:120}} value={item.unitPrice} onChange={e => handleItemPriceChange(i, e.target.value)} /></td>
                    <td className="fw-semibold">₹{item.totalPrice?.toFixed(2) || '0.00'}</td>
                  </tr>
                ))}
                <tr className="table-light">
                  <td colSpan="4" className="text-end fw-bold">Total Amount</td>
                  <td className="fw-bold text-success">₹{form.totalAmount?.toFixed(2) || '0.00'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        <div className="d-flex gap-2 justify-content-end">
          <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/quotations')}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
            Submit Quotation
          </button>
        </div>
      </form>
    </Layout>
  )
}
export default QuotationForm

