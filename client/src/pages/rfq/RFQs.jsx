import { useState, useEffect } from 'react'
import Layout from '../../components/layout/Layout'
import { getRFQs, deleteRFQ } from '../../services/api'
import { formatDate } from '../../utils/helpers'
import StatusBadge from '../../components/common/StatusBadge'
import Spinner from '../../components/common/Spinner'
import ConfirmModal from '../../components/common/ConfirmModal'
import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

const RFQs = () => {
  const [rfqs, setRFQs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [confirm, setConfirm] = useState({ show: false, id: null })
  const { addNotification } = useApp()

  const fetchRFQs = () => {
    getRFQs({ search }).then(r => setRFQs(r.data.rfqs ?? [])).catch(console.error).finally(() => setLoading(false))
  }
  useEffect(() => { fetchRFQs() }, [search])

  const handleDelete = async () => {
    try {
      await deleteRFQ(confirm.id)
      addNotification('RFQ deleted', 'success')
      fetchRFQs()
    } catch { addNotification('Failed to delete RFQ', 'error') }
    setConfirm({ show: false, id: null })
  }

  return (
    <Layout title="RFQ Management">
      <div className="page-header">
        <h4><i className="bi bi-file-earmark-text me-2 text-primary"></i>Request for Quotations</h4>
        <Link to="/rfqs/new" className="btn btn-primary"><i className="bi bi-plus me-1"></i>Create RFQ</Link>
      </div>
      <div className="table-card mb-4 p-3">
        <div className="input-group" style={{maxWidth:400}}>
          <span className="input-group-text bg-white"><i className="bi bi-search text-muted"></i></span>
          <input type="text" className="form-control border-start-0" placeholder="Search RFQs..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>
      {loading ? <Spinner /> : (
        <div className="table-card">
          <table className="table table-hover">
            <thead>
              <tr><th>#</th><th>RFQ Title</th><th>Products</th><th>Deadline</th><th>Vendors Assigned</th><th>Status</th><th>Created</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {rfqs.length === 0 ? (
                <tr><td colSpan="8" className="text-center text-muted py-4">No RFQs found</td></tr>
              ) : rfqs.map((r, i) => (
                <tr key={r._id}>
                  <td className="text-muted">{i + 1}</td>
                  <td><div className="fw-semibold">{r.title}</div></td>
                  <td style={{fontSize:'0.875rem'}}>{r.items?.length || 0} item(s)</td>
                  <td style={{fontSize:'0.875rem'}}>{formatDate(r.deadline)}</td>
                  <td style={{fontSize:'0.875rem'}}>{r.vendors?.length || 0}</td>
                  <td><StatusBadge status={r.status} /></td>
                  <td style={{fontSize:'0.875rem'}}>{formatDate(r.createdAt)}</td>
                  <td>
                    <div className="d-flex gap-1">
                      <Link to={`/rfqs/${r._id}`} className="btn btn-sm btn-outline-primary"><i className="bi bi-eye"></i></Link>
                      <Link to={`/rfqs/edit/${r._id}`} className="btn btn-sm btn-outline-secondary"><i className="bi bi-pencil"></i></Link>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => setConfirm({ show: true, id: r._id })}><i className="bi bi-trash"></i></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <ConfirmModal show={confirm.show} title="Delete RFQ" message="Delete this RFQ?" onConfirm={handleDelete} onCancel={() => setConfirm({ show: false, id: null })} />
    </Layout>
  )
}
export default RFQs
