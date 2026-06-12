import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import ExpenseStatusBadge from '../../components/ExpenseStatusBadge'
import ApprovalTimeline from '../../components/ApprovalTimeline'
import { getMyExpenses } from '../../services/api'
import { formatCurrency, formatDate } from '../../utils/helpers'
import { useAuth } from '../../context/AuthContext'

export default function ExpenseHistory() {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState(null)
  const [filter, setFilter]     = useState('all')

  useEffect(() => { getMyExpenses().then(r => setExpenses(r.data.data || [])).finally(() => setLoading(false)) }, [])

  const filtered = expenses.filter(e => filter === 'all' || e.status === filter)

  return (
    <Layout title="My Expense History">
      <div className="d-flex gap-2 mb-3 flex-wrap">
        {['all','pending','in_review','approved','rejected'].map(s => (
          <button key={s} className={`btn btn-sm ${filter===s?'btn-primary':'btn-outline-secondary'}`} onClick={() => setFilter(s)} style={{textTransform:'capitalize'}}>
            {s === 'in_review' ? 'In Review' : s.charAt(0).toUpperCase()+s.slice(1)}
          </button>
        ))}
      </div>

      <div className="row g-3">
        <div className={selected ? 'col-lg-7' : 'col-12'}>
          <div className="table-card">
            <div className="table-responsive">
              {loading ? <div className="text-center p-5"><div className="spinner-border text-primary"/></div> : (
              <table className="table table-hover mb-0">
                <thead><tr><th>Category</th><th>Amount</th><th>Date</th><th>Status</th></tr></thead>
                <tbody>
                  {filtered.map(e => (
                    <tr key={e._id} style={{cursor:'pointer', background: selected?._id===e._id ? '#f0f9ff' : ''}}
                      onClick={() => setSelected(e)}>
                      <td>
                        <strong>{e.category}</strong><br/>
                        <small className="text-muted">{e.description?.substring(0,40)}{e.description?.length>40?'...':''}</small>
                      </td>
                      <td>{formatCurrency(e.amount, e.currency)}</td>
                      <td>{formatDate(e.date)}</td>
                      <td><ExpenseStatusBadge status={e.status}/></td>
                    </tr>
                  ))}
                  {!filtered.length && <tr><td colSpan={4} className="text-center text-muted py-4">No expenses found</td></tr>}
                </tbody>
              </table>
              )}
            </div>
          </div>
        </div>

        {selected && (
          <div className="col-lg-5">
            <div className="form-card">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <h6 className="fw-semibold mb-0">Expense Details</h6>
                <button className="btn-close btn-sm" onClick={() => setSelected(null)}/>
              </div>
              <div className="mb-3">
                <p className="text-muted small mb-1" style={{fontWeight:600}}>Description</p>
                <p className="mb-0">{selected.description}</p>
              </div>
              <div className="row g-2 mb-3">
                {[
                  ['Category', selected.category],
                  ['Original Amount', formatCurrency(selected.amount, selected.currency)],
                  ['In Company Currency', formatCurrency(selected.convertedAmount, user?.company?.currency)],
                  ['Date', formatDate(selected.date)],
                ].map(([label, value]) => (
                  <div key={label} className="col-6">
                    <p className="text-muted small mb-0" style={{fontWeight:600}}>{label}</p>
                    <p className="mb-0 fw-semibold" style={{fontSize:'0.9rem'}}>{value}</p>
                  </div>
                ))}
              </div>
              <hr/>
              <h6 className="fw-semibold mb-3">Approval Status</h6>
              <ApprovalTimeline steps={selected.approvalSteps || []}/>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
