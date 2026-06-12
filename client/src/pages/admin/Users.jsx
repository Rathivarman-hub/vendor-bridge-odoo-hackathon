import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import { getAllUsers, createUser, updateUser, deleteUser, getManagers } from '../../services/api'
import { toast } from 'react-toastify'
import { ROLES } from '../../utils/helpers'

const empty = { name:'', email:'', password:'', role:'employee', managerId:'' }

export default function Users() {
  const [users, setUsers]     = useState([])
  const [managers, setManagers] = useState([])
  const [form, setForm]       = useState(empty)
  const [editId, setEditId]   = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)

  const load = () => {
    getAllUsers().then(r => setUsers(r.data.data || []))
    getManagers().then(r => setManagers(r.data.data || []))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setForm(empty); setEditId(null); setShowModal(true) }
  const openEdit   = (u) => { setForm({ name:u.name, email:u.email, password:'', role:u.role, managerId:u.manager?._id||'' }); setEditId(u._id); setShowModal(true) }

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      if (editId) { await updateUser(editId, form); toast.success('User updated') }
      else        { await createUser(form);         toast.success('User created') }
      setShowModal(false); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
    finally { setLoading(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return
    try { await deleteUser(id); toast.success('Deleted'); load() }
    catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  return (
    <Layout title="User Management">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0 fw-semibold">Employees & Managers</h5>
        <button className="btn btn-primary btn-sm" onClick={openCreate}>
          <i className="bi bi-plus-circle me-1" />Add User
        </button>
      </div>

      <div className="table-card">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Manager</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td><div className="d-flex align-items-center gap-2">
                    <div style={{width:32,height:32,borderRadius:'50%',background:'#ede9fe',color:'#4f46e5',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'0.8rem'}}>
                      {u.name?.[0]?.toUpperCase()}
                    </div>{u.name}
                  </div></td>
                  <td>{u.email}</td>
                  <td><span className="badge" style={{background:'#ede9fe',color:'#5b21b6',textTransform:'capitalize'}}>{u.role}</span></td>
                  <td>{u.manager?.name || '—'}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-1" onClick={() => openEdit(u)}><i className="bi bi-pencil" /></button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(u._id)}><i className="bi bi-trash" /></button>
                  </td>
                </tr>
              ))}
              {!users.length && <tr><td colSpan={5} className="text-center text-muted py-4">No users yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal show d-block" style={{background:'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editId ? 'Edit User' : 'Add User'}</h5>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Full Name</label>
                    <input className="form-control" required value={form.name} onChange={e => setForm({...form, name:e.target.value})} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" required value={form.email} onChange={e => setForm({...form, email:e.target.value})} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">{editId ? 'New Password (leave blank to keep)' : 'Password'}</label>
                    <input type="password" className="form-control" minLength={editId ? 0 : 6} required={!editId}
                      value={form.password} onChange={e => setForm({...form, password:e.target.value})} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Role</label>
                    <select className="form-select" value={form.role} onChange={e => setForm({...form, role:e.target.value})}>
                      {ROLES.map(r => <option key={r} value={r} style={{textTransform:'capitalize'}}>{r}</option>)}
                    </select>
                  </div>
                  {form.role === 'employee' && (
                    <div className="mb-3">
                      <label className="form-label">Assign Manager</label>
                      <select className="form-select" value={form.managerId} onChange={e => setForm({...form, managerId:e.target.value})}>
                        <option value="">No manager</option>
                        {managers.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                      </select>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? <span className="spinner-border spinner-border-sm" /> : (editId ? 'Update' : 'Create')}
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
