import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import { getApprovalRules, createApprovalRule, updateApprovalRule, deleteApprovalRule, getAllUsers } from '../../services/api'
import { toast } from 'react-toastify'

const emptyRule = { name:'', ruleType:'sequential', conditionType:'percentage', conditionValue:100, approvers:[], isActive:true }

export default function ApprovalRules() {
  const [rules, setRules]     = useState([])
  const [users, setUsers]     = useState([])
  const [form, setForm]       = useState(emptyRule)
  const [editId, setEditId]   = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)

  const load = () => {
    getApprovalRules().then(r => setRules(r.data.data || []))
    getAllUsers().then(r => setUsers(r.data.data || []))
  }
  useEffect(() => { load() }, [])

  const openCreate = () => { setForm(emptyRule); setEditId(null); setShowModal(true) }
  const openEdit   = (r) => { setForm({ name:r.name, ruleType:r.ruleType, conditionType:r.conditionType, conditionValue:r.conditionValue, approvers:r.approvers.map(a=>({userId:a.user?._id||a.userId, sequence:a.sequence, isManagerApprover:a.isManagerApprover})), isActive:r.isActive }); setEditId(r._id); setShowModal(true) }

  const addApprover = () => setForm({ ...form, approvers: [...form.approvers, { userId:'', sequence: form.approvers.length+1, isManagerApprover:false }] })
  const removeApprover = (i) => setForm({ ...form, approvers: form.approvers.filter((_,idx)=>idx!==i) })
  const updateApprover = (i, field, val) => {
    const updated = [...form.approvers]
    updated[i] = { ...updated[i], [field]: val }
    setForm({ ...form, approvers: updated })
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      if (editId) { await updateApprovalRule(editId, form); toast.success('Rule updated') }
      else        { await createApprovalRule(form);         toast.success('Rule created') }
      setShowModal(false); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
    finally { setLoading(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this rule?')) return
    try { await deleteApprovalRule(id); toast.success('Deleted'); load() } catch { toast.error('Error') }
  }

  return (
    <Layout title="Approval Rules">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0 fw-semibold">Configure Approval Workflows</h5>
        <button className="btn btn-primary btn-sm" onClick={openCreate}><i className="bi bi-plus-circle me-1"/>Add Rule</button>
      </div>

      <div className="row g-3">
        {rules.map(r => (
          <div key={r._id} className="col-md-6">
            <div className="form-card">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <h6 className="mb-1 fw-semibold">{r.name}</h6>
                  <span className="badge badge-bg-light me-1" style={{textTransform:'capitalize'}}>{r.ruleType}</span>
                  <span className="badge" style={{background:r.isActive?'#d1fae5':'#fee2e2',color:r.isActive?'#065f46':'#991b1b'}}>{r.isActive?'Active':'Inactive'}</span>
                </div>
                <div>
                  <button className="btn btn-sm btn-outline-primary me-1" onClick={() => openEdit(r)}><i className="bi bi-pencil"/></button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(r._id)}><i className="bi bi-trash"/></button>
                </div>
              </div>
              <p className="small text-muted mb-2">
                Condition: <strong>{r.conditionType === 'percentage' ? `${r.conditionValue}% approval` : r.conditionType === 'specific_approver' ? 'Specific approver' : 'Hybrid'}</strong>
              </p>
              <div>
                {r.approvers?.map((a,i) => (
                  <div key={i} className="d-flex align-items-center gap-2 mb-1">
                    <span className="badge badge-bg-light">Step {a.sequence}</span>
                    <span className="small">{a.user?.name || 'Unknown'}</span>
                    {a.isManagerApprover && <span className="badge" style={{background:'#dbeafe',color:'#1e40af',fontSize:'0.7rem'}}>Manager</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
        {!rules.length && (
          <div className="col-12">
            <div className="form-card text-center text-muted py-5">
              <i className="bi bi-diagram-3 fs-1 d-block mb-2"/>
              No approval rules yet. Create one to define workflows.
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal show d-block" style={{background:'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editId ? 'Edit Rule' : 'Create Approval Rule'}</h5>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Rule Name</label>
                      <input className="form-control" required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Standard Approval" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Rule Type</label>
                      <select className="form-select" value={form.ruleType} onChange={e=>setForm({...form,ruleType:e.target.value})}>
                        <option value="sequential">Sequential (Step by step)</option>
                        <option value="parallel">Parallel (All at once)</option>
                        <option value="conditional">Conditional</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Condition Type</label>
                      <select className="form-select" value={form.conditionType} onChange={e=>setForm({...form,conditionType:e.target.value})}>
                        <option value="percentage">Percentage</option>
                        <option value="specific_approver">Specific Approver</option>
                        <option value="hybrid">Hybrid (% OR specific)</option>
                      </select>
                    </div>
                    {(form.conditionType === 'percentage' || form.conditionType === 'hybrid') && (
                      <div className="col-md-6">
                        <label className="form-label">Approval % Required</label>
                        <input type="number" className="form-control" min={1} max={100} value={form.conditionValue}
                          onChange={e=>setForm({...form,conditionValue:Number(e.target.value)})} />
                      </div>
                    )}
                    <div className="col-12">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <label className="form-label mb-0">Approvers</label>
                        <button type="button" className="btn btn-sm btn-outline-primary" onClick={addApprover}>
                          <i className="bi bi-plus me-1"/>Add Approver
                        </button>
                      </div>
                      {form.approvers.map((a,i) => (
                        <div key={i} className="d-flex gap-2 mb-2 align-items-center p-2 rounded" style={{background:'#f8fafc'}}>
                          <span className="badge bg-secondary">Step {a.sequence}</span>
                          <select className="form-select form-select-sm" value={a.userId} onChange={e=>updateApprover(i,'userId',e.target.value)} required>
                            <option value="">Select user</option>
                            {users.map(u=><option key={u._id} value={u._id}>{u.name} ({u.role})</option>)}
                          </select>
                          <div className="form-check mb-0 text-nowrap">
                            <input className="form-check-input" type="checkbox" id={`mgr-${i}`} checked={a.isManagerApprover}
                              onChange={e=>updateApprover(i,'isManagerApprover',e.target.checked)} />
                            <label className="form-check-label small" htmlFor={`mgr-${i}`}>Is Manager</label>
                          </div>
                          <button type="button" className="btn btn-sm btn-outline-danger" onClick={()=>removeApprover(i)}>
                            <i className="bi bi-x"/>
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="col-12">
                      <div className="form-check">
                        <input className="form-check-input" type="checkbox" id="isActive" checked={form.isActive}
                          onChange={e=>setForm({...form,isActive:e.target.checked})} />
                        <label className="form-check-label" htmlFor="isActive">Active</label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? <span className="spinner-border spinner-border-sm"/> : (editId ? 'Update' : 'Create')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
