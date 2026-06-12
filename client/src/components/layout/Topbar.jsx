import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../../services/api'
import useNotificationSocket from '../../hooks/useNotificationSocket'
import { formatDate } from '../../utils/helpers'
import ThemeToggle from '../ThemeToggle'

export default function Topbar({ title, onMenuClick }) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  
  const [notifications, setNotifications] = useState([])
  const [showNotifs, setShowNotifs] = useState(false)
  const notifRef = useRef()

  // Setup real-time notifications
  useNotificationSocket((notification) => {
    // Prepend new notification to the list
    setNotifications(prev => [notification, ...prev])
  })

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchNotifications = async () => {
    try {
      const { data } = await getNotifications()
      setNotifications(data)
    } catch {}
  }

  const handleMarkRead = async (id) => {
    await markNotificationRead(id)
    fetchNotifications()
  }

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead()
    fetchNotifications()
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="topbar">
      {/* Hamburger (mobile only) */}
      <button className="topbar-hamburger" onClick={onMenuClick} aria-label="Open menu">
        <i className="bi bi-list"></i>
      </button>

      <span className="topbar-title">{title}</span>

      <div className="d-flex align-items-center gap-3 ms-auto">
        {/* Dark / Light toggle */}
        <ThemeToggle />

        {/* Notification Bell */}
        <div className="position-relative" ref={notifRef}>
          <button
            className="btn btn-link p-1 position-relative"
            style={{ color: 'var(--text-muted)', fontSize: '1.15rem' }}
            onClick={() => setShowNotifs(!showNotifs)}
            aria-label="Notifications"
          >
            <i className="bi bi-bell"></i>
            {unreadCount > 0 && (
              <span
                className="position-absolute top-0 start-100 translate-middle badge rounded-pill"
                style={{ fontSize: '0.55rem', background: 'var(--danger)', lineHeight: 1, padding: '3px 5px' }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div
              className="notif-dropdown dropdown-menu show shadow position-absolute end-0 mt-1"
              style={{ minWidth: 300, background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom" style={{ borderColor: 'var(--border)' }}>
                <span className="fw-bold" style={{ fontSize: '0.875rem', color: 'var(--text)' }}>Notifications</span>
                {unreadCount > 0 && (
                  <button className="btn btn-link btn-sm p-0 text-decoration-none" onClick={handleMarkAllRead} style={{ fontSize: '0.78rem' }}>
                    Mark all read
                  </button>
                )}
              </div>
              <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div className="text-center py-4" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <i className="bi bi-bell-slash d-block mb-1" style={{ fontSize: '1.4rem' }}></i>
                    No notifications
                  </div>
                ) : (
                  notifications.slice(0, 15).map(n => (
                    <div key={n._id} className={`notif-item p-2 border-bottom ${!n.isRead ? 'notif-unread' : ''}`} style={{ borderColor: 'var(--border)' }}>
                      <div className="d-flex justify-content-between align-items-start gap-2">
                        <div className="fw-semibold" style={{ fontSize: '0.82rem', color: !n.isRead ? 'var(--text)' : 'var(--text-muted)', lineHeight: 1.4 }}>
                          {n.link
                            ? <Link to={n.link} className="text-decoration-none text-reset" onClick={() => { setShowNotifs(false); if (!n.isRead) handleMarkRead(n._id) }}>{n.title}</Link>
                            : n.title
                          }
                        </div>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>{formatDate(n.createdAt)}</span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.3, marginTop: 2 }}>{n.message}</div>
                      {!n.isRead && (
                        <button className="btn btn-link p-0 mt-1" style={{ fontSize: '0.7rem', color: 'var(--primary)' }} onClick={() => handleMarkRead(n._id)}>
                          Mark read
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Dropdown */}
        <div className="dropdown">
          <button className="btn btn-sm dropdown-toggle d-flex align-items-center gap-2" data-bs-toggle="dropdown" style={{ background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text)' }}>
            <div className="rounded-circle d-flex align-items-center justify-content-center text-white" style={{ background: 'var(--primary)', width: 28, height: 28, fontSize: '0.7rem', fontWeight: 700 }}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="d-none d-sm-inline" style={{ fontSize: '0.85rem' }}>{user?.name?.split(' ')[0]}</span>
          </button>
          <ul className="dropdown-menu dropdown-menu-end shadow" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <li><span className="dropdown-item-text text-muted" style={{ fontSize: '0.75rem' }}>{user?.email}</span></li>
            <li><span className="dropdown-item-text badge badge-bg-light ms-3 text-capitalize" style={{ fontSize: '0.65rem' }}>{user?.role?.replace('_', ' ')}</span></li>
            <li><hr className="dropdown-divider" style={{ borderColor: 'var(--border)' }} /></li>
            <li><button className="dropdown-item text-danger" onClick={handleLogout}><i className="bi bi-box-arrow-right me-2"></i>Logout</button></li>
          </ul>
        </div>
      </div>
    </div>
  )
}
