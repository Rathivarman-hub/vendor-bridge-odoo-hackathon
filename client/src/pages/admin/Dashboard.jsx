import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import StatCard from '../../components/StatCard'
import ExpenseStatusBadge from '../../components/ExpenseStatusBadge'
import { getAllExpenses } from '../../services/api'
import { formatCurrency, formatDate } from '../../utils/helpers'
import { useAuth } from '../../context/AuthContext'

export default function AdminDashboard() {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllExpenses().then(r => setExpenses(r.data.data || [])).finally(() => setLoading(false))
  }, [])

  const stats = {
    total:    expenses.length,
    pending:  expenses.filter(e => e.status === 'pending' || e.status === 'in_review').length,
    approved: expenses.filter(e => e.status === 'approved').length,
    rejected: expenses.filter(e => e.status === 'rejected').length,
    totalAmt: expenses.filter(e => e.status === 'approved').reduce((s, e) => s + (e.convertedAmount || e.amount), 0),
  }

  return (
    <Layout title="Admin Dashboard">
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3"><StatCard title="Total Expenses" value={stats.total} icon="bi-receipt" color="primary" /></div>
        <div className="col-sm-6 col-xl-3"><StatCard title="Pending Review" value={stats.pending} icon="bi-clock-history" color="warning" /></div>
        <div className="col-sm-6 col-xl-3"><StatCard title="Approved" value={stats.approved} icon="bi-check-circle" color="success" /></div>
        <div className="col-sm-6 col-xl-3"><StatCard title="Total Reimbursed" value={formatCurrency(stats.totalAmt, user?.company?.currency)} icon="bi-currency-dollar" color="info" sub="Approved only" /></div>
      </div>

      <div className="table-card">
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
          <h6 className="mb-0 fw-semibold">Recent Expenses</h6>
        </div>
        {loading ? (
          <div className="text-center p-5"><div className="spinner-border text-primary" /></div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead><tr>
                <th>Employee</th><th>Category</th><th>Amount</th><th>Date</th><th>Status</th>
              </tr></thead>
              <tbody>
                {expenses.slice(0, 10).map(e => (
                  <tr key={e._id}>
                    <td>{e.employee?.name || '—'}</td>
                    <td><span className="badge badge-bg-light">{e.category}</span></td>
                    <td>{formatCurrency(e.amount, e.currency)}</td>
                    <td>{formatDate(e.date)}</td>
                    <td><ExpenseStatusBadge status={e.status} /></td>
                  </tr>
                ))}
                {!expenses.length && <tr><td colSpan={5} className="text-center text-muted py-4">No expenses yet</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  )
}
