import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import API from '../../services/api'
import ThemeToggle from '../../components/ThemeToggle'

const ResetPassword = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 6) return setError('Password must be at least 6 characters.')
    if (form.password !== form.confirm) return setError('Passwords do not match.')
    try {
      setLoading(true)
      await API.post(`/auth/reset-password/${token}`, { password: form.password })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. The link may have expired.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page flex-column">
      <div className="w-100 d-flex justify-content-end mb-3" style={{maxWidth: 420}}>
        <ThemeToggle />
      </div>
      <div className="auth-card" style={{ maxWidth: 420 }}>
        <div className="text-center mb-4">
            <div className="bg-primary d-inline-flex align-items-center justify-content-center rounded-3 mb-3"
              style={{ width: 56, height: 56 }}>
              <i className="bi bi-shield-lock text-white fs-4"></i>
            </div>
            <h4 className="fw-bold">Set New Password</h4>
            <p className="text-muted" style={{ fontSize: '0.875rem' }}>Enter and confirm your new password.</p>
          </div>

          {success ? (
            <div className="text-center">
              <div className="alert alert-success">
                <i className="bi bi-check-circle me-2"></i>
                Password reset successfully! Redirecting to login…
              </div>
              <Link to="/login" className="btn btn-primary w-100">Go to Login</Link>
            </div>
          ) : (
            <>
              {error && <div className="alert alert-danger py-2" style={{ fontSize: '0.875rem' }}>{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">New Password</label>
                  <input
                    type="password" className="form-control" placeholder="Min. 6 characters"
                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label">Confirm Password</label>
                  <input
                    type="password" className="form-control" placeholder="Re-enter password"
                    value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} required
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                  {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
                  Reset Password
                </button>
              </form>
              <hr className="my-4" />
              <p className="text-center text-muted mb-0" style={{ fontSize: '0.875rem' }}>
                Remember it? <Link to="/login" className="text-primary">Back to Login</Link>
              </p>
            </>
          )}
      </div>
    </div>
  )
}
export default ResetPassword
