import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import ExpenseStatusBadge from '../../components/ExpenseStatusBadge'
import { getAllExpenses } from '../../services/api'
import { formatCurrency, formatDate } from '../../utils/helpers'
import { useAuth } from '../../context/AuthContext'

export default function TeamExpenses() {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading]   = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    getAllExpenses().then(r => setExpenses(r.data.data || [])).finally(() => setLoading(false))
  }, [])

  return (
    <Layout title="Team Expenses">
      <div className="table-card">
        <div className="table-responsive">
          {loading ? <div className="text-center p-5"><div className="spinner-border text-primary"/></div> : (
          <table className="table table-hover mb-0">
            <thead><tr><th>Employee</th><th>Category</th><th>Amount</th><th>Date</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {expenses.map(e => (
                <tr key={e._id}>
                  <td>{e.employee?.name}</td>
                  <td><span className="badge badge-bg-light">{e.category}</span></td>
                  <td>{formatCurrency(e.convertedAmount || e.amount, user?.company?.currency)}</td>
                  <td>{formatDate(e.date)}</td>
                  <td><ExpenseStatusBadge status={e.status}/></td>
                  <td><button className="btn btn-sm btn-outline-primary" onClick={() => navigate(`/manager/expenses/${e._id}`)}>View</button></td>
                </tr>
              ))}
              {!expenses.length && <tr><td colSpan={6} className="text-center text-muted py-4">No expenses</td></tr>}
            </tbody>
          </table>
          )}
        </div>
      </div>
    </Layout>
  )
}
