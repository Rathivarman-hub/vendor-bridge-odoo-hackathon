import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import ExpenseStatusBadge from '../../components/ExpenseStatusBadge'
import { getAllExpenses, overrideExpense } from '../../services/api'
import { formatCurrency, formatDate } from '../../utils/helpers'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

export default function AllExpenses() {
  const [expenses, setExpenses] = useState([])
  const [filter, setFilter]     = useState('all')
  const [search, setSearch]     = useState('')
  const [loading, setLoading]   = useState(true)
  const navigate = useNavigate()

  const load = () => { getAllExpenses().then(r => setExpenses(r.data.data || [])).finally(() => setLoading(false)) }
  useEffect(() => { load() }, [])

  const filtered = expenses.filter(e => {
    const matchStatus = filter === 'all' || e.status === filter
    const matchSearch = e.employee?.name?.toLowerCase().includes(search.toLowerCase()) ||
                        e.category?.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const handleOverride = async (id, action) => {
    const comment = prompt(`Reason for ${action}?`)
    if (!comment) return
    try {
      await overrideExpense(id, { action, comment })
      toast.success(`Expense ${action}d`)
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  return (
    <Layout title="All Expenses">
      <div className="d-flex gap-2 mb-3 flex-wrap">
        <input className="form-control" style={{maxWidth:240}} placeholder="Search by name or category..."
          value={search} onChange={e => setSearch(e.target.value)} />
        {['all','pending','in_review','approved','rejected'].map(s => (
          <button key={s} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setFilter(s)} style={{textTransform:'capitalize'}}>
            {s === 'in_review' ? 'In Review' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className="table-card">
        <div className="table-responsive">
          {loading ? <div className="text-center p-5"><div className="spinner-border text-primary" /></div> : (
          <table className="table table-hover mb-0">
            <thead><tr><th>Employee</th><th>Category</th><th>Amount</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e._id}>
                  <td>{e.employee?.name || '—'}</td>
                  <td><span className="badge badge-bg-light">{e.category}</span></td>
                  <td>{formatCurrency(e.amount, e.currency)}</td>
                  <td>{formatDate(e.date)}</td>
                  <td><ExpenseStatusBadge status={e.status} /></td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-1" onClick={() => navigate(`/admin/expenses/${e._id}`)}>
                      <i className="bi bi-eye" />
                    </button>
                    {(e.status === 'pending' || e.status === 'in_review') && <>
                      <button className="btn btn-sm btn-outline-success me-1" onClick={() => handleOverride(e._id,'approve')}>
                        <i className="bi bi-check" />
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleOverride(e._id,'reject')}>
                        <i className="bi bi-x" />
                      </button>
                    </>}
                  </td>
                </tr>
              ))}
              {!filtered.length && <tr><td colSpan={6} className="text-center text-muted py-4">No expenses found</td></tr>}
            </tbody>
          </table>
          )}
        </div>
      </div>
    </Layout>
  )
}
