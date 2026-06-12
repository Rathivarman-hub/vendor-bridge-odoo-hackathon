import { useState } from 'react'
import { Link } from 'react-router-dom'
import { forgotPassword } from '../../services/api'
import ThemeToggle from '../../components/ThemeToggle'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return setError('Email is required.')
    try {
      setLoading(true)
      await forgotPassword({ email })
      setMsg('Reset link sent! Check your email.')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset link.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page flex-column">
      <div className="w-100 d-flex justify-content-end mb-3" style={{maxWidth: 400}}>
        <ThemeToggle />
      </div>
      <div className="auth-card" style={{ maxWidth: 400 }}>
        <div className="text-center mb-4">
            <h4 className="fw-bold">Forgot Password</h4>
            <p className="text-muted" style={{fontSize:'0.875rem'}}>Enter your email to receive a reset link</p>
          </div>
          {msg && <div className="alert alert-success py-2">{msg}</div>}
          {error && <div className="alert alert-danger py-2">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-control" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
              Send Reset Link
            </button>
          </form>
          <p className="text-center mt-3 mb-0"><Link to="/login" className="text-primary" style={{fontSize:'0.875rem'}}>Back to Login</Link></p>
      </div>
    </div>
  )
}
export default ForgotPassword
