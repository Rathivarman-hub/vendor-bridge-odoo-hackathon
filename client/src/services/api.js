import axios from 'axios'

const envUrl = import.meta.env.VITE_API_URL
let apiUrl = 'https://vendor-bridge-odoo-hackathon.onrender.com/api'

if (envUrl) {
  apiUrl = envUrl.endsWith('/api') ? envUrl : `${envUrl.replace(/\/$/, '')}/api`
}

const API = axios.create({
  baseURL: apiUrl,
})

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// Auth
export const loginUser = (data) => API.post('/auth/login', data)
export const registerUser = (data) => API.post('/auth/register', data)
export const forgotPassword = (data) => API.post('/auth/forgot-password', data)

// Dashboard
export const getDashboard = () => API.get('/dashboard')

// Vendors
export const getVendors = (params) => API.get('/vendors', { params })
export const getVendorById = (id) => API.get(`/vendors/${id}`)
export const createVendor = (data) => API.post('/vendors', data)
export const updateVendor = (id, data) => API.put(`/vendors/${id}`, data)
export const deleteVendor = (id) => API.delete(`/vendors/${id}`)

// RFQs
export const getRFQs = (params) => API.get('/rfqs', { params })
export const getRFQById = (id) => API.get(`/rfqs/${id}`)
export const createRFQ = (data) => API.post('/rfqs', data)
export const updateRFQ = (id, data) => API.put(`/rfqs/${id}`, data)
export const deleteRFQ = (id) => API.delete(`/rfqs/${id}`)

// Quotations
export const getQuotations = (params) => API.get('/quotations', { params })
export const getQuotationById = (id) => API.get(`/quotations/${id}`)
export const createQuotation = (data) => API.post('/quotations', data)
export const updateQuotation = (id, data) => API.put(`/quotations/${id}`, data)
export const compareQuotations = (rfqId) => API.get(`/quotations/compare/${rfqId}`)

// Approvals
export const getApprovals = (params) => API.get('/approvals', { params })
export const createApproval = (data) => API.post('/approvals', data)
export const approveRequest = (id, data) => API.put(`/approvals/${id}/approve`, data)
export const rejectRequest = (id, data) => API.put(`/approvals/${id}/reject`, data)

// Purchase Orders
export const getPurchaseOrders = (params) => API.get('/purchase-orders', { params })
export const getPurchaseOrderById = (id) => API.get(`/purchase-orders/${id}`)
export const createPurchaseOrder = (data) => API.post('/purchase-orders', data)

// Invoices
export const getInvoices = (params) => API.get('/invoices', { params })
export const getInvoiceById = (id) => API.get(`/invoices/${id}`)
export const createInvoice = (data) => API.post('/invoices', data)
export const sendInvoiceEmail = (id) => API.post(`/invoices/${id}/send-email`)
export const downloadInvoicePDF = (id) => API.get(`/invoices/${id}/pdf`, { responseType: 'blob' })

// Logs
export const getActivityLogs = (params) => API.get('/logs', { params })

// Reports
export const getReports = (params) => API.get('/reports', { params })

// Notifications
export const getNotifications = () => API.get('/notifications')
export const markNotificationRead = (id) => API.put(`/notifications/${id}/read`)
export const markAllNotificationsRead = () => API.put('/notifications/read-all')

export default API
