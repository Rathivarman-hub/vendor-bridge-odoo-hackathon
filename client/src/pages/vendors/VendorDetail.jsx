import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import { getVendorById } from '../../services/api'
import { formatDate } from '../../utils/helpers'
import StatusBadge from '../../components/common/StatusBadge'
import Spinner from '../../components/common/Spinner'

const VendorDetail = () => {
  const { id } = useParams()
  const [vendor, setVendor] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getVendorById(id)
      .then(res => setVendor(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Layout title="Vendor Detail"><Spinner /></Layout>

  if (!vendor) return (
    <Layout title="Vendor Detail">
      <div className="text-center py-5">
        <h4 className="text-muted">Vendor not found</h4>
        <Link to="/vendors" className="btn btn-primary mt-3">Back to Vendors</Link>
      </div>
    </Layout>
  )

  return (
    <Layout title={`Vendor: ${vendor.name}`}>
      <div className="page-header">
        <h4><i className="bi bi-building me-2 text-primary"></i>{vendor.name}</h4>
        <div className="d-flex gap-2">
          <Link to="/vendors" className="btn btn-outline-secondary">
            <i className="bi bi-arrow-left me-1"></i>Back
          </Link>
          <Link to={`/vendors/edit/${vendor._id}`} className="btn btn-primary">
            <i className="bi bi-pencil me-1"></i>Edit Vendor
          </Link>
        </div>
      </div>

      <div className="row g-4">
        {/* Basic Info */}
        <div className="col-md-6">
          <div className="stat-card h-100">
            <h6 className="fw-bold border-bottom pb-2 mb-3">Basic Information</h6>
            <table className="table table-borderless table-sm">
              <tbody>
                <tr><td className="text-muted" style={{width:'140px'}}>Vendor Name:</td><td className="fw-semibold">{vendor.name}</td></tr>
                <tr><td className="text-muted">Category:</td><td><span className="badge badge-bg-light">{vendor.category}</span></td></tr>
                <tr><td className="text-muted">Status:</td><td><StatusBadge status={vendor.status} /></td></tr>
                <tr><td className="text-muted">Registered On:</td><td>{formatDate(vendor.createdAt)}</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Contact Info */}
        <div className="col-md-6">
          <div className="stat-card h-100">
            <h6 className="fw-bold border-bottom pb-2 mb-3">Contact Details</h6>
            <table className="table table-borderless table-sm">
              <tbody>
                <tr><td className="text-muted" style={{width:'140px'}}>Contact Person:</td><td className="fw-semibold">{vendor.contactPerson}</td></tr>
                <tr><td className="text-muted">Email:</td><td><a href={`mailto:${vendor.email}`} className="text-decoration-none">{vendor.email}</a></td></tr>
                <tr><td className="text-muted">Phone:</td><td>{vendor.phone}</td></tr>
                <tr><td className="text-muted">Address:</td><td>{vendor.address || 'N/A'}</td></tr>
                <tr><td className="text-muted">GST Number:</td><td>{vendor.gstNumber || 'N/A'}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default VendorDetail
