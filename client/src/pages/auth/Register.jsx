import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../../services/api'
import ThemeToggle from '../../components/ThemeToggle'

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name || !form.email || !form.password) return setError('All fields are required.')
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.')
    if (form.password.length < 6) return setError('Password must be at least 6 characters.')
    try {
      setLoading(true)
      await registerUser(form)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page flex-column">
      <div className="w-100 d-flex justify-content-end mb-3" style={{maxWidth: 480}}>
        <ThemeToggle />
      </div>
      <div className="auth-card" style={{maxWidth:480}}>
        <div className="text-center mb-4">
          <div className="bg-primary d-inline-flex align-items-center justify-content-center rounded-3 mb-3" style={{width:56,height:56}}>
            <i className="bi bi-person-plus text-white fs-4"></i>
          </div>
          <h4 className="fw-bold">Create Account</h4>
          <p className="text-muted" style={{fontSize:'0.875rem'}}>Join VendorBridge ERP</p>
        </div>
        {error && <div className="alert alert-danger py-2" style={{fontSize:'0.875rem'}}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Full Name</label>
            <input type="text" name="name" className="form-control" placeholder="John Doe" value={form.name} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Email Address</label>
            <input type="email" name="email" className="form-control" placeholder="you@company.com" value={form.email} onChange={handleChange} required />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input type="password" name="password" className="form-control" placeholder="Min 6 characters" value={form.password} onChange={handleChange} required />
          </div>
          <div className="mb-4">
            <label className="form-label">Confirm Password</label>
            <input type="password" name="confirmPassword" className="form-control" placeholder="Repeat password" value={form.confirmPassword} onChange={handleChange} required />
          </div>
          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
            Create Account
          </button>
        </form>
        <hr className="my-4" style={{borderColor: 'var(--border)'}} />
        <p className="text-center text-muted mb-0" style={{fontSize:'0.875rem'}}>
          Already have an account? <Link to="/login" style={{color: 'var(--primary)', textDecoration:'none'}}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
export default Register
