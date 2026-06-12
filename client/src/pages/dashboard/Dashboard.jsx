import { useState, useEffect } from 'react'
import Layout from '../../components/layout/Layout'
import { getDashboard } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { formatCurrency, formatDate } from '../../utils/helpers'
import StatusBadge from '../../components/common/StatusBadge'
import { Link } from 'react-router-dom'
import Spinner from '../../components/common/Spinner'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

const StatCard = ({ icon, label, value, color, link, sub }) => (
  <div className="col-6 col-lg-3">
    <Link to={link || '#'} className="text-decoration-none">
      <div className="stat-card">
        <div className="d-flex justify-content-between align-items-start">
          <div className="flex-grow-1 overflow-hidden">
            <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-muted)', margin: 0 }}>
              {label}
            </p>
            <h3 className="fw-bold mb-0 mt-1 text-truncate" style={{ fontSize: '1.5rem', color: 'var(--text)' }}>{value ?? 0}</h3>
            {sub && <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4, marginBottom: 0 }}>{sub}</p>}
          </div>
          <div className="stat-icon" style={{ background: color + '20', color, flexShrink: 0 }}>
            <i className={`bi ${icon}`}></i>
          </div>
        </div>
      </div>
    </Link>
  </div>
)

// Custom tooltip for area chart
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        padding: '10px 14px',
        boxShadow: 'var(--shadow)',
        fontSize: '0.8rem',
      }}>
        <p style={{ color: 'var(--text-muted)', margin: 0, marginBottom: 4 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color, margin: 0, fontWeight: 600 }}>
            {p.name}: {p.name === 'Revenue' ? formatCurrency(p.value) : p.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

const Dashboard = () => {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const isAdminOrManager = ['admin', 'manager'].includes(user?.role)

  useEffect(() => {
    getDashboard().then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <Layout title="Dashboard"><Spinner /></Layout>

  const stats = data?.analytics || {}
  const recentPOs = data?.recentOrders || []
  const recentInvoices = data?.recentInvoices || []
  const pendingApprovals = data?.pendingApprovals || []
  const monthlySpend = data?.monthlySpend || []

  // Build donut data from stats
  const donutData = [
    { name: 'Vendors', value: stats.totalVendors || 0 },
    { name: 'RFQs', value: stats.activeRFQs || 0 },
    { name: 'Quotations', value: stats.totalQuotations || 0 },
  ].filter(d => d.value > 0)
  
  // Add pending approvals only for admin/manager
  if (isAdminOrManager) {
    donutData.push({ name: 'Pending', value: stats.pendingApprovals || 0 })
  }

  return (
    <Layout title="Dashboard">
      {/* Stats Row */}
      <div className="row g-3 mb-4">
        {isAdminOrManager && (
          <StatCard icon="bi-hourglass-split"     label="Pending Approvals" value={stats.pendingApprovals}          color="#f59e0b" link="/approvals" />
        )}
        <StatCard icon="bi-file-earmark-text"   label="Active RFQs"       value={stats.activeRFQs}                color="#3b82f6" link="/rfqs" />
        <StatCard icon="bi-people"              label="Total Vendors"      value={stats.totalVendors}              color="#10b981" link="/vendors" />
        <StatCard icon="bi-chat-square-quote"   label="Total Quotations"   value={stats.totalQuotations}           color="#8b5cf6" link="/quotations" />
        {isAdminOrManager && (
          <StatCard icon="bi-cash-coin"           label="Total Spend"        value={formatCurrency(stats.totalSpend || 0)} color="#ef4444" link="/reports" />
        )}
      </div>

      {/* Charts Row */}
      <div className="row g-3 mb-4">
        {/* Monthly spend area chart */}
        <div className="col-12 col-xl-8">
          <div className="table-card p-3 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0">Monthly Spend Trend</h6>
              {isAdminOrManager && (
                <Link to="/reports" className="btn btn-sm btn-outline-primary" style={{ fontSize: '0.75rem' }}>Full Report</Link>
              )}
            </div>
            {monthlySpend.length === 0 ? (
              <div className="d-flex flex-column align-items-center justify-content-center py-5" style={{ color: 'var(--text-muted)' }}>
                <i className="bi bi-bar-chart" style={{ fontSize: '2rem', opacity: 0.4 }}></i>
                <p className="mt-2 mb-0" style={{ fontSize: '0.875rem' }}>No spend data yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={monthlySpend} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    name="Revenue"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    fill="url(#spendGrad)"
                    dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: 'var(--surface)' }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Procurement overview donut */}
        <div className="col-12 col-xl-4">
          <div className="table-card p-3 h-100">
            <h6 className="fw-bold mb-3">Procurement Overview</h6>
            {donutData.length === 0 ? (
              <div className="d-flex flex-column align-items-center justify-content-center py-5" style={{ color: 'var(--text-muted)' }}>
                <i className="bi bi-pie-chart" style={{ fontSize: '2rem', opacity: 0.4 }}></i>
                <p className="mt-2 mb-0" style={{ fontSize: '0.875rem' }}>No data yet</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={donutData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                      {donutData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="d-flex flex-wrap justify-content-center gap-2 mt-2">
                  {donutData.map((d, i) => (
                    <div key={d.name} className="d-flex align-items-center gap-1">
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: PIE_COLORS[i % PIE_COLORS.length], display: 'inline-block' }}></span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{d.name} ({d.value})</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions - Enhanced */}
      <div className="table-card p-4 mb-4">
        <div className="d-flex align-items-center gap-2 mb-3">
          <i className="bi bi-lightning-charge" style={{ color: 'var(--primary)', fontSize: '1.1rem' }}></i>
          <h6 className="fw-bold mb-0">Quick Actions</h6>
        </div>
        <div className="row g-2">
          {/* Primary Actions */}
          <div className="col-6 col-sm-4 col-md-3">
            <Link to="/rfqs/new" className="text-decoration-none">
              <div className="quick-action-btn">
                <i className="bi bi-file-earmark-plus"></i>
                <span>New RFQ</span>
              </div>
            </Link>
          </div>
          
          <div className="col-6 col-sm-4 col-md-3">
            <Link to="/vendors/new" className="text-decoration-none">
              <div className="quick-action-btn">
                <i className="bi bi-person-plus"></i>
                <span>Add Vendor</span>
              </div>
            </Link>
          </div>

          <div className="col-6 col-sm-4 col-md-3">
            <Link to="/quotations" className="text-decoration-none">
              <div className="quick-action-btn">
                <i className="bi bi-chat-square-quote"></i>
                <span>View Quotations</span>
              </div>
            </Link>
          </div>

          <div className="col-6 col-sm-4 col-md-3">
            <Link to="/purchase-orders" className="text-decoration-none">
              <div className="quick-action-btn">
                <i className="bi bi-box-seam"></i>
                <span>Purchase Orders</span>
              </div>
            </Link>
          </div>

          {isAdminOrManager && (
            <>
              <div className="col-6 col-sm-4 col-md-3">
                <Link to="/approvals" className="text-decoration-none">
                  <div className="quick-action-btn">
                    <i className="bi bi-check-circle"></i>
                    <span>Approvals</span>
                  </div>
                </Link>
              </div>

              <div className="col-6 col-sm-4 col-md-3">
                <Link to="/invoices" className="text-decoration-none">
                  <div className="quick-action-btn">
                    <i className="bi bi-receipt"></i>
                    <span>Invoices</span>
                  </div>
                </Link>
              </div>

              <div className="col-6 col-sm-4 col-md-3">
                <Link to="/reports" className="text-decoration-none">
                  <div className="quick-action-btn">
                    <i className="bi bi-graph-up"></i>
                    <span>Reports</span>
                  </div>
                </Link>
              </div>

              <div className="col-6 col-sm-4 col-md-3">
                <Link to="/users" className="text-decoration-none">
                  <div className="quick-action-btn">
                    <i className="bi bi-people"></i>
                    <span>User Management</span>
                  </div>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Widgets Row */}
      <div className="row g-3">
        {/* Pending Approvals - Only for Admin/Manager */}
        {isAdminOrManager && (
          <div className="col-12 col-md-4">
            <div className="table-card h-100">
              <div className="p-3 border-bottom d-flex justify-content-between align-items-center" style={{ borderColor: 'var(--border)' }}>
                <h6 className="fw-bold mb-0">Pending Approvals</h6>
                <Link to="/approvals" className="btn btn-sm btn-outline-primary" style={{ fontSize: '0.72rem' }}>View All</Link>
              </div>
              <div className="p-2">
                {pendingApprovals.length === 0 ? (
                  <p className="text-center py-3 mb-0" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No pending approvals</p>
                ) : pendingApprovals.slice(0, 5).map(a => (
                  <div key={a._id} className="d-flex justify-content-between align-items-center p-2 rounded mb-1" style={{ background: 'var(--surface-2)' }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)' }}>{a.rfq?.title || 'RFQ'}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{formatDate(a.createdAt)}</div>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recent POs */}
        <div className="col-12 col-md-4">
          <div className="table-card h-100">
            <div className="p-3 border-bottom d-flex justify-content-between align-items-center" style={{ borderColor: 'var(--border)' }}>
              <h6 className="fw-bold mb-0">Recent Purchase Orders</h6>
              <Link to="/purchase-orders" className="btn btn-sm btn-outline-primary" style={{ fontSize: '0.72rem' }}>View All</Link>
            </div>
            <div className="p-2">
              {recentPOs.length === 0 ? (
                <p className="text-center py-3 mb-0" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No purchase orders</p>
              ) : recentPOs.slice(0, 5).map(po => (
                <Link key={po._id} to={`/purchase-orders/${po._id}`} className="text-decoration-none">
                  <div className="d-flex justify-content-between align-items-center p-2 rounded mb-1" style={{ background: 'var(--surface-2)' }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)' }}>{po.poNumber}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{formatCurrency(po.totalAmount)}</div>
                    </div>
                    <StatusBadge status={po.status} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="col-12 col-md-4">
          <div className="table-card h-100">
            <div className="p-3 border-bottom d-flex justify-content-between align-items-center" style={{ borderColor: 'var(--border)' }}>
              <h6 className="fw-bold mb-0">Recent Invoices</h6>
              <Link to="/invoices" className="btn btn-sm btn-outline-primary" style={{ fontSize: '0.72rem' }}>View All</Link>
            </div>
            <div className="p-2">
              {recentInvoices.length === 0 ? (
                <p className="text-center py-3 mb-0" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No invoices</p>
              ) : recentInvoices.slice(0, 5).map(inv => (
                <Link key={inv._id} to={`/invoices/${inv._id}`} className="text-decoration-none">
                  <div className="d-flex justify-content-between align-items-center p-2 rounded mb-1" style={{ background: 'var(--surface-2)' }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)' }}>{inv.invoiceNumber}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{formatCurrency(inv.totalAmount)}</div>
                    </div>
                    <StatusBadge status={inv.status} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Dashboard
