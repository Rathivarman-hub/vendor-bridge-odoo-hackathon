import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { section: 'Main', items: [
    { to: '/dashboard', icon: 'bi-grid-1x2', label: 'Dashboard', roles: ['admin', 'procurement_officer', 'manager', 'vendor'] },
  ]},
  { section: 'Procurement', items: [
    { to: '/vendors',           icon: 'bi-building',        label: 'Vendors',            roles: ['admin', 'procurement_officer'] },
    { to: '/rfqs',              icon: 'bi-file-earmark-text', label: 'RFQs',             roles: ['admin', 'procurement_officer', 'vendor'] },
    { to: '/quotations',        icon: 'bi-chat-quote',      label: 'Quotations',         roles: ['admin', 'procurement_officer', 'vendor'] },
    { to: '/quotation-compare', icon: 'bi-bar-chart-steps', label: 'Compare Quotations', roles: ['admin', 'procurement_officer', 'manager'] },
  ]},
  { section: 'Operations', items: [
    { to: '/approvals',      icon: 'bi-check2-circle', label: 'Approvals',       roles: ['admin', 'manager'] },
    { to: '/purchase-orders', icon: 'bi-cart-check',  label: 'Purchase Orders',  roles: ['admin', 'procurement_officer', 'vendor'] },
    { to: '/invoices',       icon: 'bi-receipt',       label: 'Invoices',         roles: ['admin', 'procurement_officer'] },
  ]},
  { section: 'Insights', items: [
    { to: '/reports', icon: 'bi-graph-up',     label: 'Reports & Analytics', roles: ['admin', 'manager'] },
    { to: '/logs',    icon: 'bi-clock-history', label: 'Activity Logs',       roles: ['admin', 'manager'] },
  ]},
  { section: 'Administration', items: [
    { to: '/users', icon: 'bi-people', label: 'User Management', roles: ['admin'] },
  ]},
]

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth()

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-brand d-flex align-items-center justify-content-between">
        <div>
          <h5><i className="bi bi-box-seam me-2"></i>VendorBridge</h5>
          <small>Procurement ERP</small>
        </div>
        {/* Close button visible on mobile */}
        <button
          onClick={onClose}
          className="d-lg-none btn btn-link text-white p-0"
          style={{ fontSize: '1.2rem', lineHeight: 1 }}
        >
          <i className="bi bi-x-lg"></i>
        </button>
      </div>
      <div className="p-3 border-bottom" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="d-flex align-items-center gap-2">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center text-white"
            style={{ width: 36, height: 36, fontSize: '0.8rem', fontWeight: 700, background: 'var(--primary)', flexShrink: 0 }}
          >
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="overflow-hidden">
            <div className="text-white text-truncate" style={{ fontSize: '0.8rem', fontWeight: 600 }}>{user?.name || 'User'}</div>
            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textTransform: 'capitalize' }}>{user?.role?.replace('_', ' ') || 'Role'}</div>
          </div>
        </div>
      </div>
      <nav className="sidebar-nav">
        {navItems.map(section => {
          const visible = section.items.filter(item => !user?.role || item.roles.includes(user.role))
          if (visible.length === 0) return null
          return (
            <div key={section.section}>
              <div className="nav-section-title">{section.section}</div>
              {visible.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <i className={`bi ${item.icon}`}></i>
                  {item.label}
                </NavLink>
              ))}
            </div>
          )
        })}
      </nav>
    </div>
  )
}

export default Sidebar

