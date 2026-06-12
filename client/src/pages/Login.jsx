import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { authService } from '../services/api'

export default function Login() {
  const [form, setForm]   = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const { login }   = useAuth()
  const { addToast } = useToast()
  const navigate    = useNavigate()

  const validate = () => {
    const e = {}
    if (!form.email)    e.email    = 'Email is required'
    if (!form.password) e.password = 'Password is required'
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email'
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const { data } = await authService.login(form)
      login(data.user, data.token)
      addToast(`Welcome back, ${data.user.name}!`, 'success')
      navigate('/dashboard')
    } catch (err) {
      addToast(err.response?.data?.message || 'Login failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: '1.8rem',
            fontWeight: 800, marginBottom: '0.5rem'
          }}>
            Reimburse<span style={{ color: 'var(--accent)' }}>Flow</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="rf-form-group">
            <label className="rf-label">Email Address</label>
            <input
              type="email"
              className="rf-input"
              placeholder="you@company.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
            {errors.email && <div style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.3rem' }}>{errors.email}</div>}
          </div>

          <div className="rf-form-group">
            <label className="rf-label">Password</label>
            <input
              type="password"
              className="rf-input"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
            />
            {errors.password && <div style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.3rem' }}>{errors.password}</div>}
          </div>

          <button
            type="submit"
            className="btn-rf-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', padding: '0.75rem' }}
            disabled={loading}
          >
            {loading
              ? <><span className="spinner-border spinner-border-sm" /> Signing in...</>
              : <><i className="bi bi-box-arrow-in-right" /> Sign In</>
            }
          </button>
        </form>

        <hr className="divider" />
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          New company?{' '}
          <Link to="/signup" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
            Create account
          </Link>
        </p>
      </div>
    </div>
  )
}
