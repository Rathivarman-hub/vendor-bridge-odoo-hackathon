import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const adminLinks = [
  { to: '/admin/dashboard',      icon: 'bi-speedometer2',    label: 'Dashboard' },
  { to: '/admin/users',          icon: 'bi-people',          label: 'Users' },
  { to: '/admin/expenses',       icon: 'bi-receipt',         label: 'All Expenses' },
  { to: '/admin/approval-rules', icon: 'bi-diagram-3',       label: 'Approval Rules' },
  { to: '/admin/company',        icon: 'bi-building',        label: 'Company' },
]

const managerLinks = [
  { to: '/manager/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
  { to: '/manager/pending',   icon: 'bi-clock-history', label: 'Pending Approvals' },
  { to: '/manager/expenses',  icon: 'bi-receipt',       label: 'Team Expenses' },
]

const employeeLinks = [
  { to: '/employee/dashboard', icon: 'bi-speedometer2',  label: 'Dashboard' },
  { to: '/employee/submit',    icon: 'bi-plus-circle',   label: 'Submit Expense' },
  { to: '/employee/history',   icon: 'bi-clock-history', label: 'My Expenses' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const links = user?.role === 'admin' ? adminLinks
              : user?.role === 'manager' ? managerLinks
              : employeeLinks

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <nav className="sidebar d-flex flex-column">
      <div className="sidebar-brand">
        <div className="d-flex align-items-center gap-2">
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <i className="bi bi-cash-stack text-white" style={{ fontSize: '1rem' }} />
          </div>
          <h5 className="mb-0">Reimburse<span>Flow</span></h5>
        </div>
      </div>

      <div className="sidebar-nav flex-grow-1">
        <div className="nav-section-title">
          {user?.role?.toUpperCase() || 'MENU'}
        </div>
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <i className={`bi ${l.icon}`} />
            {l.label}
          </NavLink>
        ))}
      </div>

      <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="d-flex align-items-center gap-2 mb-3">
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'linear-gradient(135deg, #4f46e5, #818cf8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: '0.85rem'
          }}>
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <div style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600 }}>{user?.name}</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem', textTransform: 'capitalize' }}>{user?.role}</div>
          </div>
        </div>
        <button className="btn btn-sm w-100" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', border: 'none' }}
          onClick={handleLogout}>
          <i className="bi bi-box-arrow-right me-2" />Logout
        </button>
      </div>
    </nav>
  )
}
