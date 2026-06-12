import { useState, useEffect } from 'react'
import Layout from '../../components/layout/Layout'
import { createVendor, updateVendor, getVendorById } from '../../services/api'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

const initial = { name: '', email: '', phone: '', address: '', category: 'IT', gstNumber: '', contactPerson: '', website: '', status: 'active', notes: '' }

const VendorForm = () => {
  const [form, setForm] = useState(initial)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const { id } = useParams()
  const navigate = useNavigate()
  const { addNotification } = useApp()
  const isEdit = !!id

  useEffect(() => {
    if (isEdit) getVendorById(id).then(r => setForm(r.data)).catch(console.error)
  }, [id])

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Vendor name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email'
    if (!form.phone.trim()) e.phone = 'Phone is required'
    if (!form.address.trim()) e.address = 'Address is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    try {
      setLoading(true)
      if (isEdit) await updateVendor(id, form)
      else await createVendor(form)
      addNotification(`Vendor ${isEdit ? 'updated' : 'created'} successfully!`, 'success')
      navigate('/vendors')
    } catch (err) {
      addNotification(err.response?.data?.message || 'Failed to save vendor', 'error')
    } finally { setLoading(false) }
  }

  return (
    <Layout title={isEdit ? 'Edit Vendor' : 'Add Vendor'}>
      <div className="page-header">
        <h4><i className="bi bi-building me-2 text-primary"></i>{isEdit ? 'Edit Vendor' : 'Add New Vendor'}</h4>
      </div>
      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Vendor Name *</label>
              <input name="name" className={`form-control ${errors.name ? 'is-invalid' : ''}`} value={form.name} onChange={handleChange} />
              {errors.name && <div className="invalid-feedback">{errors.name}</div>}
            </div>
            <div className="col-md-6">
              <label className="form-label">Email *</label>
              <input type="email" name="email" className={`form-control ${errors.email ? 'is-invalid' : ''}`} value={form.email} onChange={handleChange} />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>
            <div className="col-md-6">
              <label className="form-label">Phone *</label>
              <input name="phone" className={`form-control ${errors.phone ? 'is-invalid' : ''}`} value={form.phone} onChange={handleChange} />
              {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
            </div>
            <div className="col-md-6">
              <label className="form-label">Contact Person</label>
              <input name="contactPerson" className="form-control" value={form.contactPerson} onChange={handleChange} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Category</label>
              <select name="category" className="form-select" value={form.category} onChange={handleChange}>
                <option value="IT">IT</option>
                <option value="Office Supplies">Office Supplies</option>
                <option value="Raw Materials">Raw Materials</option>
                <option value="Services">Services</option>
                <option value="Logistics">Logistics</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">GST Number</label>
              <input name="gstNumber" className="form-control" value={form.gstNumber} onChange={handleChange} placeholder="22AAAAA0000A1Z5" />
            </div>
            <div className="col-md-6">
              <label className="form-label">Website</label>
              <input name="website" className="form-control" value={form.website} onChange={handleChange} placeholder="https://vendor.com" />
            </div>
            <div className="col-md-6">
              <label className="form-label">Status</label>
              <select name="status" className="form-select" value={form.status} onChange={handleChange}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="col-12">
              <label className="form-label">Address *</label>
              <textarea name="address" className={`form-control ${errors.address ? 'is-invalid' : ''}`} rows={2} value={form.address} onChange={handleChange}></textarea>
              {errors.address && <div className="invalid-feedback">{errors.address}</div>}
            </div>
            <div className="col-12">
              <label className="form-label">Notes</label>
              <textarea name="notes" className="form-control" rows={2} value={form.notes} onChange={handleChange}></textarea>
            </div>
            <div className="col-12 d-flex gap-2 justify-content-end">
              <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/vendors')}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
                {isEdit ? 'Update Vendor' : 'Add Vendor'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  )
}
export default VendorForm
