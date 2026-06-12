import { useState, useEffect } from 'react'
import Layout from '../../components/layout/Layout'
import { createRFQ, updateRFQ, getRFQById, getVendors } from '../../services/api'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

const emptyItem = { description: '', quantity: 1, unit: 'pcs' }

const RFQForm = () => {
  const [form, setForm] = useState({ title: '', description: '', deadline: '', items: [{ ...emptyItem }], vendors: [], notes: '', attachments: [] })
  const [vendors, setVendors] = useState([])
  const [attachInput, setAttachInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const { id } = useParams()
  const navigate = useNavigate()
  const { addNotification } = useApp()
  const isEdit = !!id

  useEffect(() => {
    getVendors().then(r => setVendors(r.data.vendors ?? [])).catch(console.error)
    if (isEdit) getRFQById(id).then(r => setForm(r.data)).catch(console.error)
  }, [id])

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Title is required'
    if (!form.deadline) e.deadline = 'Deadline is required'
    if (form.items.length === 0) e.items = 'At least one item required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleItemChange = (i, field, value) => {
    const items = [...form.items]
    items[i][field] = value
    setForm({ ...form, items })
  }

  const addItem = () => setForm({ ...form, items: [...form.items, { ...emptyItem }] })
  const removeItem = (i) => setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) })

  const addAttachment = () => {
    if (!attachInput.trim()) return
    setForm({ ...form, attachments: [...(form.attachments || []), { filename: attachInput.trim(), path: attachInput.trim() }] })
    setAttachInput('')
  }
  const removeAttachment = (i) => setForm({ ...form, attachments: form.attachments.filter((_, idx) => idx !== i) })

  const handleVendorToggle = (vendorId) => {
    const vendors = form.vendors.includes(vendorId)
      ? form.vendors.filter(v => v !== vendorId)
      : [...form.vendors, vendorId]
    setForm({ ...form, vendors })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    try {
      setLoading(true)

      const formData = new FormData()
      formData.append('title', form.title)
      formData.append('description', form.description)
      formData.append('deadline', form.deadline)
      formData.append('notes', form.notes)
      formData.append('items', JSON.stringify(form.items))
      formData.append('vendors', JSON.stringify(form.vendors))

      const existingAttachments = []
      form.attachments?.forEach(a => {
        if (a instanceof File) {
          formData.append('attachments', a)
        } else {
          existingAttachments.push(a)
        }
      })
      formData.append('existingAttachments', JSON.stringify(existingAttachments))

      if (isEdit) await updateRFQ(id, formData)
      else await createRFQ(formData)
      
      addNotification(`RFQ ${isEdit ? 'updated' : 'created'} successfully!`, 'success')
      navigate('/rfqs')
    } catch (err) {
      addNotification(err.response?.data?.message || 'Failed to save RFQ', 'error')
    } finally { setLoading(false) }
  }

  return (
    <Layout title={isEdit ? 'Edit RFQ' : 'Create RFQ'}>
      <div className="page-header">
        <h4><i className="bi bi-file-earmark-plus me-2 text-primary"></i>{isEdit ? 'Edit RFQ' : 'Create New RFQ'}</h4>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-md-8">
            <div className="form-card mb-3">
              <h6 className="fw-bold mb-3">RFQ Details</h6>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label">RFQ Title *</label>
                  <input name="title" className={`form-control ${errors.title ? 'is-invalid' : ''}`} value={form.title} onChange={handleChange} placeholder="e.g. Office Supplies Q1 2026" />
                  {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                </div>
                <div className="col-12">
                  <label className="form-label">Description</label>
                  <textarea name="description" className="form-control" rows={2} value={form.description} onChange={handleChange}></textarea>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Deadline *</label>
                  <input type="date" name="deadline" className={`form-control ${errors.deadline ? 'is-invalid' : ''}`} value={form.deadline?.substring(0,10)} onChange={handleChange} />
                  {errors.deadline && <div className="invalid-feedback">{errors.deadline}</div>}
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="form-card">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold mb-0">Items / Products</h6>
                <button type="button" className="btn btn-sm btn-outline-primary" onClick={addItem}><i className="bi bi-plus me-1"></i>Add Item</button>
              </div>
              {errors.items && <div className="alert alert-danger py-2 mb-3">{errors.items}</div>}
              {form.items.map((item, i) => (
                <div key={i} className="row g-2 mb-2 align-items-end p-2 rounded" style={{background:'var(--surface-2)'}}>
                  <div className="col-md-5">
                    <label className="form-label" style={{fontSize:'0.8rem', color: 'var(--text-muted)'}}>Description</label>
                    <input className="form-control form-control-sm" value={item.description} onChange={e => handleItemChange(i, 'description', e.target.value)} placeholder="Product/Service name" />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label" style={{fontSize:'0.8rem', color: 'var(--text-muted)'}}>Quantity</label>
                    <input type="number" min="1" className="form-control form-control-sm" value={item.quantity} onChange={e => handleItemChange(i, 'quantity', e.target.value)} />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label" style={{fontSize:'0.8rem', color: 'var(--text-muted)'}}>Unit</label>
                    <select className="form-select form-select-sm" value={item.unit} onChange={e => handleItemChange(i, 'unit', e.target.value)}>
                      <option value="pcs">Pcs</option><option value="kg">Kg</option>
                      <option value="litre">Litre</option><option value="box">Box</option><option value="set">Set</option>
                    </select>
                  </div>
                  <div className="col-md-1">
                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeItem(i)} disabled={form.items.length === 1}><i className="bi bi-trash"></i></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vendor Assignment */}
          <div className="col-md-4">
            <div className="form-card">
              <h6 className="fw-bold mb-3">Assign Vendors</h6>
              <div style={{maxHeight:300,overflowY:'auto'}}>
                {vendors.length === 0 ? <p className="text-muted" style={{fontSize:'0.875rem'}}>No vendors available</p>
                  : vendors.map(v => (
                  <div key={v._id} className="form-check p-2 rounded mb-1 d-flex align-items-center gap-2" 
                    style={{
                      background: form.vendors.includes(v._id) ? 'rgba(59, 130, 246, 0.15)' : 'var(--surface-2)',
                      border: form.vendors.includes(v._id) ? '1px solid var(--primary)' : '1px solid transparent'
                    }}>
                    <input className="form-check-input ms-0" type="checkbox" id={v._id}
                      checked={form.vendors.includes(v._id)}
                      onChange={() => handleVendorToggle(v._id)} />
                    <label className="form-check-label flex-grow-1" htmlFor={v._id} style={{fontSize:'0.85rem',cursor:'pointer'}}>
                      <div className="fw-semibold" style={{color: 'var(--text)'}}>{v.name}</div>
                      <div className="text-muted" style={{fontSize:'0.75rem'}}>{v.category}</div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-card mt-3">
              <label className="form-label">Notes</label>
              <textarea name="notes" className="form-control" rows={3} value={form.notes} onChange={handleChange}></textarea>
            </div>

            <div className="form-card mt-3">
              <h6 className="fw-bold mb-3"><i className="bi bi-paperclip me-1"></i>Attachments</h6>
              <div className="d-flex gap-2 mb-3">
                <input
                  type="file"
                  className="form-control form-control-sm"
                  multiple
                  onChange={e => {
                    const files = Array.from(e.target.files)
                    setForm({ ...form, attachments: [...(form.attachments || []), ...files] })
                  }}
                />
              </div>
              {(form.attachments || []).length === 0 ? (
                <p className="text-muted mb-0" style={{fontSize:'0.8rem'}}>No attachments added</p>
              ) : (
                <ul className="list-group list-group-flush">
                  {form.attachments.map((a, i) => (
                    <li key={i} className="list-group-item px-0 py-1 d-flex justify-content-between align-items-center" style={{fontSize:'0.85rem'}}>
                      <span><i className="bi bi-file-earmark me-1 text-muted"></i>{a.name || a.filename}</span>
                      <button type="button" className="btn btn-sm btn-outline-danger py-0" onClick={() => removeAttachment(i)}>
                        <i className="bi bi-x"></i>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="col-12 d-flex gap-2 justify-content-end">
            <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/rfqs')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
              {isEdit ? 'Update RFQ' : 'Create RFQ'}
            </button>
          </div>
        </div>
      </form>
    </Layout>
  )
}
export default RFQForm
