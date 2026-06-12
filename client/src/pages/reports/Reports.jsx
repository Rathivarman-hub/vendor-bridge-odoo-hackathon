import { useState, useEffect } from 'react'
import Layout from '../../components/layout/Layout'
import { getReports } from '../../services/api'
import { formatCurrency } from '../../utils/helpers'
import Spinner from '../../components/common/Spinner'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

const COLORS = ['#2563a8', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
const MONTH_NAMES = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const Reports = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getReports().then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <Layout title="Reports"><Spinner /></Layout>

  // Map backend shape → chart-friendly arrays
  const monthlyData = (data?.monthlySpend || []).map(m => ({
    month: `${MONTH_NAMES[m._id?.month] || '?'} ${m._id?.year || ''}`,
    amount: m.total || 0,
    orders: m.count || 0,
  }))

  const vendorPerf = (data?.vendorPerformance || [])   // [{name, totalOrders, rating, category}]
  const topVendors = (data?.topVendors || [])           // [{vendor:{name,category}, orders, spend}]
  const stats      = data?.procurementStats || {}       // {rfqs, quotations, orders, invoices, totalSpend}

  // Category spend from backend
  const categoryData = (data?.categorySpend || []).map(c => ({
    name: c._id || 'Other',
    value: c.totalSpend || 0,
  }))

  // CSV export helper
  const exportCSV = () => {
    const rows = [
      ['Month', 'Total Spend (₹)', 'Orders'],
      ...monthlyData.map(r => [r.month, r.amount, r.orders]),
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'vendorbridge_monthly_report.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Layout title="Reports & Analytics">
      <div className="page-header">
        <h4><i className="bi bi-graph-up me-2 text-primary"></i>Reports & Analytics</h4>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-success" onClick={exportCSV}>
            <i className="bi bi-download me-1"></i>Export CSV
          </button>
          <button className="btn btn-outline-primary" onClick={() => window.print()}>
            <i className="bi bi-printer me-1"></i>Print
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Spend',   value: formatCurrency(stats.totalSpend || 0), icon: 'bi-currency-rupee', color: '#2563a8' },
          { label: 'Total RFQs',    value: stats.rfqs ?? 0,     icon: 'bi-file-earmark-text', color: '#10b981' },
          { label: 'Total POs',     value: stats.orders ?? 0,   icon: 'bi-cart-check',         color: '#f59e0b' },
          { label: 'Total Invoices',value: stats.invoices ?? 0, icon: 'bi-receipt',            color: '#8b5cf6' },
        ].map((s, i) => (
          <div className="col-md-3" key={i}>
            <div className="stat-card">
              <div className="d-flex justify-content-between">
                <div>
                  <p className="text-muted mb-1" style={{fontSize:'0.75rem',textTransform:'uppercase',fontWeight:600}}>{s.label}</p>
                  <h4 className="fw-bold mb-0">{s.value}</h4>
                </div>
                <div className="stat-icon" style={{background:s.color+'20',color:s.color}}>
                  <i className={`bi ${s.icon}`}></i>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3 mb-4">
        {/* Monthly Trends */}
        <div className="col-md-8">
          <div className="table-card p-3">
            <h6 className="fw-bold mb-3">Monthly Procurement Trends (Last 6 Months)</h6>
            {monthlyData.length === 0 ? (
              <p className="text-muted text-center py-4">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" style={{fontSize:'0.75rem'}} />
                  <YAxis style={{fontSize:'0.75rem'}} />
                  <Tooltip formatter={(v, name) => name === 'amount' ? formatCurrency(v) : v} />
                  <Legend />
                  <Bar dataKey="amount" fill="#2563a8" name="Spend (₹)" radius={[4,4,0,0]} />
                  <Bar dataKey="orders" fill="#10b981" name="Orders" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Spend by Category */}
        <div className="col-md-4">
          <div className="table-card p-3">
            <h6 className="fw-bold mb-3">Spend by Category</h6>
            {categoryData.length === 0 ? (
              <p className="text-muted text-center py-4">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" outerRadius={90} dataKey="value" nameKey="name"
                    label={({name, percent}) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}
                    style={{fontSize:'0.7rem'}}>
                    {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Top Vendors by Spend */}
      <div className="table-card mb-4">
        <div className="p-3 border-bottom"><h6 className="fw-bold mb-0">Top Vendors by Spend</h6></div>
        <table className="table table-hover">
          <thead>
            <tr><th>Vendor</th><th>Category</th><th>Total Orders</th><th>Total Spend</th></tr>
          </thead>
          <tbody>
            {topVendors.length === 0 ? (
              <tr><td colSpan="4" className="text-center text-muted py-4">No data available</td></tr>
            ) : topVendors.map((t, i) => (
              <tr key={i}>
                <td className="fw-semibold">{t.vendor?.name || '—'}</td>
                <td><span className="badge badge-bg-light">{t.vendor?.category || '—'}</span></td>
                <td>{t.orders}</td>
                <td className="fw-semibold text-primary">{formatCurrency(t.spend)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Vendor Performance */}
      <div className="table-card">
        <div className="p-3 border-bottom"><h6 className="fw-bold mb-0">Vendor Performance</h6></div>
        <table className="table table-hover">
          <thead>
            <tr><th>Vendor</th><th>Category</th><th>Total Orders</th><th>Rating</th></tr>
          </thead>
          <tbody>
            {vendorPerf.length === 0 ? (
              <tr><td colSpan="4" className="text-center text-muted py-4">No data available</td></tr>
            ) : vendorPerf.map((v, i) => (
              <tr key={i}>
                <td className="fw-semibold">{v.name}</td>
                <td><span className="badge badge-bg-light">{v.category}</span></td>
                <td>{v.totalOrders}</td>
                <td>
                  {[1,2,3,4,5].map(s => (
                    <i key={s} className={`bi bi-star${s <= (v.rating || 0) ? '-fill' : ''} text-warning`} style={{fontSize:'0.8rem'}}></i>
                  ))}
                  <span className="ms-1 text-muted" style={{fontSize:'0.8rem'}}>({v.rating?.toFixed(1) || 0})</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  )
}
export default Reports
