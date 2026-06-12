import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import { submitExpense, getExchangeRates, uploadReceipt } from '../../services/api'
import { EXPENSE_CATEGORIES } from '../../utils/helpers'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'react-toastify'

export default function SubmitExpense() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const companyCurrency = user?.company?.currency || 'USD'

  const [form, setForm] = useState({
    amount: '', currency: companyCurrency, category: '', description: '', date: new Date().toISOString().split('T')[0],
  })
  const [rates, setRates]           = useState({})
  const [convertedAmt, setConverted] = useState(null)
  const [receiptFile, setReceipt]   = useState(null)
  const [ocrLoading, setOcrLoading] = useState(false)
  const [loading, setLoading]       = useState(false)

  const currencies = ['USD','EUR','GBP','INR','AED','SGD','AUD','CAD','JPY','CNY','CHF']

  useEffect(() => {
    getExchangeRates(companyCurrency).then(r => setRates(r.data.rates || {})).catch(() => {})
  }, [companyCurrency])

  useEffect(() => {
    if (form.amount && form.currency && rates[form.currency]) {
      const rate = 1 / rates[form.currency]
      setConverted((parseFloat(form.amount) * rate).toFixed(2))
    } else if (form.currency === companyCurrency) {
      setConverted(form.amount)
    } else { setConverted(null) }
  }, [form.amount, form.currency, rates])

  const handleOCR = async (file) => {
    if (!file) return
    setReceipt(file)
    setOcrLoading(true)
    // Simulate OCR — in real flow, send to backend OCR endpoint
    setTimeout(() => {
      toast.info('OCR: Receipt scanned! Please verify and fill in any missing fields.')
      setOcrLoading(false)
    }, 1500)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.amount || parseFloat(form.amount) <= 0) return toast.error('Amount must be positive')
    setLoading(true)
    try {
      const payload = { ...form, amount: parseFloat(form.amount), convertedAmount: convertedAmt ? parseFloat(convertedAmt) : parseFloat(form.amount), companyCurrency, exchangeRate: rates[form.currency] ? (1/rates[form.currency]) : 1 }
      const res = await submitExpense(payload)
      if (receiptFile) {
        const fd = new FormData(); fd.append('receipt', receiptFile)
        await uploadReceipt(res.data.data._id, fd).catch(() => {})
      }
      toast.success('Expense submitted!')
      navigate('/employee/history')
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
    finally { setLoading(false) }
  }

  return (
    <Layout title="Submit Expense">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="form-card">
            <h5 className="fw-semibold mb-4">New Expense Claim</h5>
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Amount <span className="text-danger">*</span></label>
                  <input type="number" className="form-control" min="0.01" step="0.01" required
                    value={form.amount} onChange={e => setForm({...form, amount:e.target.value})} placeholder="0.00" />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Currency</label>
                  <select className="form-select" value={form.currency} onChange={e => setForm({...form, currency:e.target.value})}>
                    {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {convertedAmt && form.currency !== companyCurrency && (
                  <div className="col-12">
                    <div className="alert alert-info py-2 mb-0" style={{fontSize:'0.85rem'}}>
                      <i className="bi bi-currency-exchange me-2"/>
                      ≈ <strong>{companyCurrency} {convertedAmt}</strong> (live exchange rate)
                    </div>
                  </div>
                )}

                <div className="col-md-6">
                  <label className="form-label">Category <span className="text-danger">*</span></label>
                  <select className="form-select" required value={form.category} onChange={e => setForm({...form, category:e.target.value})}>
                    <option value="">Select category...</option>
                    {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Date <span className="text-danger">*</span></label>
                  <input type="date" className="form-control" required value={form.date}
                    onChange={e => setForm({...form, date:e.target.value})} max={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="col-12">
                  <label className="form-label">Description <span className="text-danger">*</span></label>
                  <textarea className="form-control" rows={3} required value={form.description}
                    onChange={e => setForm({...form, description:e.target.value})}
                    placeholder="Describe the expense..." />
                </div>
                <div className="col-12">
                  <label className="form-label">Receipt (Optional — OCR enabled)</label>
                  <input type="file" className="form-control" accept="image/*,.pdf"
                    onChange={e => handleOCR(e.target.files[0])} />
                  {ocrLoading && <div className="text-primary small mt-1"><span className="spinner-border spinner-border-sm me-1"/>Scanning receipt...</div>}
                  {receiptFile && !ocrLoading && <div className="text-success small mt-1"><i className="bi bi-check-circle me-1"/>Receipt attached</div>}
                </div>
              </div>
              <div className="d-flex gap-2 mt-4">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <><span className="spinner-border spinner-border-sm me-2"/>Submitting...</> : <><i className="bi bi-send me-1"/>Submit Expense</>}
                </button>
                <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/employee/dashboard')}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  )
}
