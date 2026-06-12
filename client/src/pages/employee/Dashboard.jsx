import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import StatCard from '../../components/StatCard'
import ExpenseStatusBadge from '../../components/ExpenseStatusBadge'
import { getMyExpenses } from '../../services/api'
import { formatCurrency, formatDate } from '../../utils/helpers'
import { useAuth } from '../../context/AuthContext'

export default function EmployeeDashboard() {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState([])
  const navigate = useNavigate()

  useEffect(() => { getMyExpenses().then(r => setExpenses(r.data.data || [])) }, [])

  const stats = {
    total:    expenses.length,
    pending:  expenses.filter(e => e.status === 'pending' || e.status === 'in_review').length,
    approved: expenses.filter(e => e.status === 'approved').length,
    totalAmt: expenses.filter(e => e.status === 'approved').reduce((s,e) => s+(e.convertedAmount||e.amount),0),
  }

  return (
    <Layout title="My Dashboard">
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-lg-3"><StatCard title="Total Submitted" value={stats.total} icon="bi-receipt" color="primary" /></div>
        <div className="col-sm-6 col-lg-3"><StatCard title="Pending" value={stats.pending} icon="bi-clock-history" color="warning" /></div>
        <div className="col-sm-6 col-lg-3"><StatCard title="Approved" value={stats.approved} icon="bi-check-circle" color="success" /></div>
        <div className="col-sm-6 col-lg-3"><StatCard title="Total Reimbursed" value={formatCurrency(stats.totalAmt, user?.company?.currency)} icon="bi-wallet2" color="info" /></div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0 fw-semibold">Recent Expenses</h5>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/employee/submit')}>
          <i className="bi bi-plus-circle me-1"/>Submit Expense
        </button>
      </div>

      <div className="table-card">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead><tr><th>Category</th><th>Amount</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              {expenses.slice(0,8).map(e => (
                <tr key={e._id}>
                  <td><span className="badge badge-bg-light">{e.category}</span><br/>
                    <small className="text-muted">{e.description?.substring(0,40)}</small>
                  </td>
                  <td>{formatCurrency(e.amount, e.currency)}</td>
                  <td>{formatDate(e.date)}</td>
                  <td><ExpenseStatusBadge status={e.status}/></td>
                </tr>
              ))}
              {!expenses.length && <tr><td colSpan={4} className="text-center text-muted py-4">No expenses yet. <a href="#" onClick={()=>navigate('/employee/submit')}>Submit one!</a></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}
