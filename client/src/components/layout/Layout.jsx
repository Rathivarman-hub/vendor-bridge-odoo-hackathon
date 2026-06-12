import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { useApp } from '../../context/AppContext'

const Layout = ({ children, title }) => {
  const { notifications } = useApp()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Close sidebar on route change (mobile)
  useEffect(() => { setSidebarOpen(false) }, [title])

  // Close on Escape key
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setSidebarOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div>
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <Topbar
          title={title}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <div className="page-content fade-in">
          {children}
        </div>
      </div>

      {/* Toast Notifications */}
      <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 9999, maxWidth: 380 }}>
        {notifications.map(n => (
          <div
            key={n.id}
            className={`toast show align-items-center text-white border-0 mb-2`}
            style={{
              background: n.type === 'error' ? 'var(--danger)' : n.type === 'success' ? 'var(--success)' : 'var(--primary)',
              borderRadius: 'var(--radius-sm)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div className="d-flex">
              <div className="toast-body" style={{ fontSize: '0.875rem' }}>{n.msg}</div>
              <button type="button" className="btn-close btn-close-white me-2 m-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Layout
