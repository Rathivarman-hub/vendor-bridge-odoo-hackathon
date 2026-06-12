import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import { getCompany, updateCompany } from '../../services/api'
import { toast } from 'react-toastify'

export default function Company() {
  const [form, setForm]   = useState({ name:'', country:'', currency:'' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getCompany().then(r => {
      const c = r.data.data
      setForm({ name: c.name, country: c.country, currency: c.currency })
    })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      await updateCompany(form)
      toast.success('Company updated!')
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
    finally { setLoading(false) }
  }

  return (
    <Layout title="Company Settings">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="form-card">
            <div className="d-flex align-items-center gap-3 mb-4">
              <div style={{width:48,height:48,borderRadius:12,background:'linear-gradient(135deg,#4f46e5,#06b6d4)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <i className="bi bi-building text-white fs-5"/>
              </div>
              <div>
                <h5 className="mb-0 fw-semibold">Company Profile</h5>
                <p className="text-muted small mb-0">Manage your company settings</p>
              </div>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Company Name</label>
                <input className="form-control" required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
              </div>
              <div className="mb-3">
                <label className="form-label">Country</label>
                <input className="form-control" readOnly value={form.country} style={{background:'#f8fafc'}} />
              </div>
              <div className="mb-3">
                <label className="form-label">Default Currency</label>
                <input className="form-control" readOnly value={form.currency} style={{background:'#f8fafc'}} />
              </div>
              <button className="btn btn-primary" disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm me-2"/> : null}Save Changes
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  )
}
