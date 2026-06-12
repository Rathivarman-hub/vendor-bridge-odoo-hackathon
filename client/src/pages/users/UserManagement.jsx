import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Layout from '../../components/layout/Layout'
import { useApp } from '../../context/AppContext'
import { formatDate } from '../../utils/helpers'
import Spinner from '../../components/common/Spinner'
import ConfirmModal from '../../components/common/ConfirmModal'
import API from '../../services/api'

// Inline API calls (admin only)
const getUsers   = ()         => API.get('/users')
const createUser = (data)     => API.post('/users', data)
const updateUser = (id, data) => API.put(`/users/${id}`, data)
const deleteUser = (id)       => API.delete(`/users/${id}`)

const ROLES = ['admin', 'procurement_officer', 'manager', 'vendor']
const ROLE_BADGES = {
  admin: 'bg-danger',
  procurement_officer: 'bg-primary',
  manager: 'bg-warning text-dark',
  vendor: 'bg-success',
}

const emptyForm = { name: '', email: '', password: '', role: 'procurement_officer' }

const UserManagement = () => {
  const [users, setUsers]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editUser, setEditUser]   = useState(null)   // null = create, obj = edit
  const [form, setForm]           = useState(emptyForm)
  const [saving, setSaving]       = useState(false)
  const [confirm, setConfirm]     = useState({ show: false, id: null })
  const { addNotification } = useApp()

  const fetchUsers = () => {
    setLoading(true)
    getUsers().then(r => setUsers(r.data.users ?? [])).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(() => { fetchUsers() }, [])

  const openCreate = () => { setEditUser(null); setForm(emptyForm); setShowModal(true) }
  const openEdit   = (u) => {
    setEditUser(u)
    setForm({ name: u.name, email: u.email, password: '', role: u.role })
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editUser) {
        const payload = { name: form.name, role: form.role }
        await updateUser(editUser._id, payload)
        addNotification('User updated successfully', 'success')
      } else {
        await createUser(form)
        addNotification('User created successfully', 'success')
      }
      setShowModal(false)
      fetchUsers()
    } catch (err) {
      addNotification(err.response?.data?.message || 'Operation failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (u) => {
    try {
      await updateUser(u._id, { isActive: !u.isActive })
      addNotification(`User ${u.isActive ? 'deactivated' : 'activated'}`, 'success')
      fetchUsers()
    } catch { addNotification('Failed to update status', 'error') }
  }

  const handleDelete = async () => {
    try {
      await deleteUser(confirm.id)
      addNotification('User deleted', 'success')
      fetchUsers()
    } catch (err) {
      addNotification(err.response?.data?.message || 'Delete failed', 'error')
    }
    setConfirm({ show: false, id: null })
  }

  return (
    <Layout title="User Management">
      <div className="page-header">
        <h4><i className="bi bi-people me-2 text-primary"></i>User Management</h4>
        <button className="btn btn-primary" onClick={openCreate}>
          <i className="bi bi-person-plus me-1"></i>Add User
        </button>
      </div>

      {loading ? <Spinner /> : (
        <div className="table-card">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan="7" className="text-center text-muted py-4">No users found</td></tr>
              ) : users.map((u, i) => (
                <tr key={u._id}>
                  <td className="text-muted">{i + 1}</td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white"
                        style={{width:32,height:32,fontSize:'0.75rem',fontWeight:700,flexShrink:0}}>
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="fw-semibold">{u.name}</span>
                    </div>
                  </td>
                  <td className="text-muted" style={{fontSize:'0.875rem'}}>{u.email}</td>
                  <td>
                    <span className={`badge ${ROLE_BADGES[u.role] || 'bg-secondary'}`} style={{fontSize:'0.7rem'}}>
                      {u.role?.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${u.isActive ? 'bg-success' : 'bg-secondary'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{fontSize:'0.875rem'}}>{formatDate(u.createdAt)}</td>
                  <td>
                    <div className="d-flex gap-1">
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => openEdit(u)} title="Edit">
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        className={`btn btn-sm ${u.isActive ? 'btn-outline-warning' : 'btn-outline-success'}`}
                        onClick={() => handleToggleActive(u)}
                        title={u.isActive ? 'Deactivate' : 'Activate'}
                      >
                        <i className={`bi bi-${u.isActive ? 'pause-circle' : 'play-circle'}`}></i>
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => setConfirm({ show: true, id: u._id })} title="Delete">
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && createPortal(
        <div className="modal show d-block" style={{background:'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className={`bi bi-${editUser ? 'pencil-square' : 'person-plus'} me-2`}></i>
                  {editUser ? 'Edit User' : 'Create User'}
                </h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Full Name</label>
                    <input className="form-control" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                  </div>
                  {!editUser && (
                    <>
                      <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input type="email" className="form-control" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input type="password" className="form-control" placeholder="Min 6 characters" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required minLength={6} />
                      </div>
                    </>
                  )}
                  <div className="mb-3">
                    <label className="form-label">Role</label>
                    <select className="form-select" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                      {ROLES.map(r => (
                        <option key={r} value={r}>{r.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
                    {editUser ? 'Save Changes' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      <ConfirmModal
        show={confirm.show}
        title="Delete User"
        message="Are you sure you want to permanently delete this user?"
        onConfirm={handleDelete}
        onCancel={() => setConfirm({ show: false, id: null })}
      />
    </Layout>
  )
}
export default UserManagement
