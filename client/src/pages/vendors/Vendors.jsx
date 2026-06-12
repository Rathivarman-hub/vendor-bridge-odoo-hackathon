import { useState, useEffect } from 'react'
import Layout from '../../components/layout/Layout'
import { getVendors, deleteVendor } from '../../services/api'
import { formatDate } from '../../utils/helpers'
import StatusBadge from '../../components/common/StatusBadge'
import Spinner from '../../components/common/Spinner'
import ConfirmModal from '../../components/common/ConfirmModal'
import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

const Vendors = () => {
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [confirm, setConfirm] = useState({ show: false, id: null })
  const { addNotification } = useApp()

  const fetchVendors = () => {
    getVendors({ search, category: categoryFilter })
      .then(r => setVendors(r.data.vendors ?? []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchVendors() }, [search, categoryFilter])

  const handleDelete = async () => {
    try {
      await deleteVendor(confirm.id)
      addNotification('Vendor deleted successfully', 'success')
      fetchVendors()
    } catch { addNotification('Failed to delete vendor', 'error') }
    setConfirm({ show: false, id: null })
  }

  return (
    <Layout title="Vendor Management">
      <div className="page-header">
        <h4><i className="bi bi-building me-2 text-primary"></i>Vendors</h4>
        <Link to="/vendors/new" className="btn btn-primary">
          <i className="bi bi-plus me-1"></i>Add Vendor
        </Link>
      </div>

      {/* Filters */}
      <div className="table-card mb-4 p-3">
        <div className="row g-2">
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text"><i className="bi bi-search text-muted"></i></span>
              <input type="text" className="form-control border-start-0" placeholder="Search vendors..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="col-md-3">
            <select className="form-select" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
              <option value="">All Categories</option>
              <option value="IT">IT</option>
              <option value="Office Supplies">Office Supplies</option>
              <option value="Raw Materials">Raw Materials</option>
              <option value="Services">Services</option>
              <option value="Logistics">Logistics</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? <Spinner /> : (
        <div className="table-card">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>#</th>
                <th>Vendor Name</th>
                <th>Category</th>
                <th>Contact</th>
                <th>GST No.</th>
                <th>Status</th>
                <th>Registered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendors.length === 0 ? (
                <tr><td colSpan="8" className="text-center text-muted py-4">No vendors found</td></tr>
              ) : vendors.map((v, i) => (
                <tr key={v._id}>
                  <td className="text-muted">{i + 1}</td>
                  <td>
                    <div className="fw-semibold">{v.name}</div>
                    <div className="text-muted" style={{fontSize:'0.75rem'}}>{v.email}</div>
                  </td>
                  <td><span className="badge badge-bg-light">{v.category}</span></td>
                  <td style={{fontSize:'0.875rem'}}>{v.phone}</td>
                  <td style={{fontSize:'0.875rem'}}>{v.gstNumber || 'N/A'}</td>
                  <td><StatusBadge status={v.status} /></td>
                  <td style={{fontSize:'0.875rem'}}>{formatDate(v.createdAt)}</td>
                  <td>
                    <div className="d-flex gap-1">
                      <Link to={`/vendors/${v._id}`} className="btn btn-sm btn-outline-primary"><i className="bi bi-eye"></i></Link>
                      <Link to={`/vendors/edit/${v._id}`} className="btn btn-sm btn-outline-secondary"><i className="bi bi-pencil"></i></Link>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => setConfirm({ show: true, id: v._id })}><i className="bi bi-trash"></i></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal show={confirm.show} title="Delete Vendor" message="Are you sure you want to delete this vendor?" onConfirm={handleDelete} onCancel={() => setConfirm({ show: false, id: null })} />
    </Layout>
  )
}
export default Vendors
