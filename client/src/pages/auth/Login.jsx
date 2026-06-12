import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginUser } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import ThemeToggle from '../../components/ThemeToggle'

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password) return setError('All fields are required.')
    try {
      setLoading(true)
      const { data } = await loginUser(form)
      login(data.user, data.token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page flex-column">
      <div className="w-100 d-flex justify-content-end mb-3" style={{maxWidth: 420}}>
        <ThemeToggle />
      </div>
      <div className="auth-card">
        <div className="text-center mb-4">
          <div className="bg-primary d-inline-flex align-items-center justify-content-center rounded-3 mb-3" style={{width:56,height:56}}>
            <i className="bi bi-box-seam text-white fs-4"></i>
          </div>
          <h4 className="fw-bold">VendorBridge</h4>
          <p className="text-muted" style={{fontSize:'0.875rem'}}>Sign in to your account</p>
        </div>
        {error && <div className="alert alert-danger py-2" style={{fontSize:'0.875rem'}}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email Address</label>
            <input type="email" name="email" className="form-control" placeholder="you@company.com" value={form.email} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input type="password" name="password" className="form-control" placeholder="••••••••" value={form.password} onChange={handleChange} required />
          </div>
          <div className="d-flex justify-content-end mb-3">
            <Link to="/forgot-password" style={{color: 'var(--primary)', fontSize:'0.875rem', textDecoration:'none'}}>Forgot password?</Link>
          </div>
          <button type="submit" className="btn btn-primary w-100 d-flex align-items-center justify-content-center" disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
            Sign In
          </button>
        </form>
        <hr className="my-4" style={{borderColor: 'var(--border)'}} />
        <p className="text-center text-muted mb-0" style={{fontSize:'0.875rem'}}>
          Don't have an account? <Link to="/register" style={{color: 'var(--primary)', textDecoration:'none'}}>Register</Link>
        </p>
      </div>
    </div>
  )
}
export default Login
