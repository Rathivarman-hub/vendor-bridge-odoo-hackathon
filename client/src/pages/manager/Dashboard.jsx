import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import StatCard from '../../components/StatCard'
import ExpenseStatusBadge from '../../components/ExpenseStatusBadge'
import { getPendingExpenses } from '../../services/api'
import { formatCurrency, formatDate } from '../../utils/helpers'
import { useAuth } from '../../context/AuthContext'

export default function ManagerDashboard() {
  const { user } = useAuth()
  const [pending, setPending] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    getPendingExpenses().then(r => setPending(r.data.data || []))
  }, [])

  return (
    <Layout title="Manager Dashboard">
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-lg-4">
          <StatCard title="Pending Approval" value={pending.length} icon="bi-clock-history" color="warning" />
        </div>
      </div>

      <div className="table-card">
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
          <h6 className="mb-0 fw-semibold">Expenses Waiting for Your Approval</h6>
          <button className="btn btn-sm btn-outline-primary" onClick={() => navigate('/manager/pending')}>View All</button>
        </div>
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead><tr><th>Employee</th><th>Category</th><th>Amount</th><th>Date</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {pending.slice(0,5).map(e => (
                <tr key={e._id} style={{cursor:'pointer'}} onClick={() => navigate(`/manager/expenses/${e._id}`)}>
                  <td>{e.employee?.name}</td>
                  <td><span className="badge badge-bg-light">{e.category}</span></td>
                  <td>{formatCurrency(e.convertedAmount || e.amount, user?.company?.currency)}</td>
                  <td>{formatDate(e.date)}</td>
                  <td><ExpenseStatusBadge status={e.status} /></td>
                  <td><button className="btn btn-sm btn-primary">Review</button></td>
                </tr>
              ))}
              {!pending.length && <tr><td colSpan={6} className="text-center text-muted py-4">No pending approvals</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}
