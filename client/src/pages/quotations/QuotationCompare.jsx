import { useState, useEffect } from 'react'
import Layout from '../../components/layout/Layout'
import { getRFQs, compareQuotations } from '../../services/api'
import { formatCurrency } from '../../utils/helpers'
import Spinner from '../../components/common/Spinner'

const QuotationCompare = () => {
  const [rfqs, setRFQs] = useState([])
  const [selectedRFQ, setSelectedRFQ] = useState('')
  const [comparisons, setComparisons] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => { getRFQs().then(r => setRFQs(r.data.rfqs ?? [])).catch(console.error) }, [])

  const handleCompare = async () => {
    if (!selectedRFQ) return
    setLoading(true)
    try {
      const { data } = await compareQuotations(selectedRFQ)
      setComparisons(data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const lowestPrice = comparisons.length > 0 ? Math.min(...comparisons.map(c => c.totalAmount)) : null

  const [sortBy, setSortBy] = useState('price_asc')
  const [filterMaxDays, setFilterMaxDays] = useState('')

  const getSortedFiltered = () => {
    let result = [...comparisons]
    if (filterMaxDays) {
      result = result.filter(c => c.deliveryDays <= parseInt(filterMaxDays))
    }
    result.sort((a, b) => {
      if (sortBy === 'price_asc') return a.totalAmount - b.totalAmount
      if (sortBy === 'price_desc') return b.totalAmount - a.totalAmount
      if (sortBy === 'delivery_asc') return a.deliveryDays - b.deliveryDays
      if (sortBy === 'rating_desc') return (b.vendor?.rating || 0) - (a.vendor?.rating || 0)
      return 0
    })
    return result
  }

  const displayedComparisons = getSortedFiltered()

  return (
    <Layout title="Compare Quotations">
      <div className="page-header">
        <h4><i className="bi bi-bar-chart-steps me-2 text-primary"></i>Quotation Comparison</h4>
      </div>
      <div className="form-card mb-4">
        <div className="row g-3 align-items-end">
          <div className="col-md-6">
            <label className="form-label">Select RFQ to Compare</label>
            <select className="form-select" value={selectedRFQ} onChange={e => setSelectedRFQ(e.target.value)}>
              <option value="">Choose an RFQ...</option>
              {rfqs.map(r => <option key={r._id} value={r._id}>{r.title}</option>)}
            </select>
          </div>
          <div className="col-md-3">
            <button className="btn btn-primary" onClick={handleCompare} disabled={!selectedRFQ || loading}>
              {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-bar-chart me-1"></i>}
              Compare
            </button>
          </div>
        </div>
      </div>

      {loading ? <Spinner /> : comparisons.length > 0 && (
        <div className="table-card">
          <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
            <h6 className="fw-bold mb-0">Comparison Results — {comparisons.length} Quotation(s)</h6>
            <div className="d-flex gap-3">
              <div className="input-group input-group-sm" style={{width: 200}}>
                <span className="input-group-text"><i className="bi bi-funnel"></i> Max Days</span>
                <input type="number" className="form-control" value={filterMaxDays} onChange={e => setFilterMaxDays(e.target.value)} placeholder="e.g. 30" />
              </div>
              <div className="input-group input-group-sm" style={{width: 220}}>
                <span className="input-group-text"><i className="bi bi-sort-down"></i> Sort</span>
                <select className="form-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                  <option value="price_asc">Price (Low to High)</option>
                  <option value="price_desc">Price (High to Low)</option>
                  <option value="delivery_asc">Delivery (Fastest)</option>
                  <option value="rating_desc">Rating (Highest)</option>
                </select>
              </div>
            </div>
          </div>
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Vendor</th>
                  <th>Total Amount</th>
                  <th>Delivery Days</th>
                  <th>Rating</th>
                  <th>Notes</th>
                  <th>Best Price?</th>
                </tr>
              </thead>
              <tbody>
                {displayedComparisons.length === 0 && <tr><td colSpan="6" className="text-center py-3">No quotations match the filter.</td></tr>}
                {displayedComparisons.map((q, i) => (
                  <tr key={q._id} className={q.totalAmount === lowestPrice ? 'table-success' : ''}>
                    <td>
                      <div className="fw-semibold">{q.vendor?.name}</div>
                      <div className="text-muted" style={{fontSize:'0.75rem'}}>{q.vendor?.email}</div>
                    </td>
                    <td className={`fw-bold ${q.totalAmount === lowestPrice ? 'text-success best-price' : ''}`}>
                      {formatCurrency(q.totalAmount)}
                    </td>
                    <td>{q.deliveryDays} days</td>
                    <td>
                      {[1,2,3,4,5].map(s => (
                        <i key={s} className={`bi bi-star${s <= (q.vendor?.rating || 0) ? '-fill' : ''} text-warning`} style={{fontSize:'0.75rem'}}></i>
                      ))}
                    </td>
                    <td style={{fontSize:'0.875rem'}}>{q.notes || '-'}</td>
                    <td>
                      {q.totalAmount === lowestPrice ? (
                        <span className="badge bg-success"><i className="bi bi-check-circle me-1"></i>Lowest Price</span>
                      ) : (
                        <span className="text-muted" style={{fontSize:'0.875rem'}}>
                          +{formatCurrency(q.totalAmount - lowestPrice)} more
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  )
}
export default QuotationCompare
