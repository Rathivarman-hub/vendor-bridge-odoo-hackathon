export const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '₹0.00'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR'
  }).format(amount)
}

export const getStatusBadge = (status) => {
  const map = {
    pending: 'badge-pending',
    approved: 'badge-approved',
    rejected: 'badge-rejected',
    draft: 'badge-draft',
    sent: 'badge-sent',
    paid: 'badge-paid',
    active: 'badge-approved',
    inactive: 'badge-rejected',
    open: 'badge-draft',
    closed: 'badge-pending',
  }
  return map[status?.toLowerCase()] || 'bg-secondary text-white'
}

export const truncate = (str, len = 30) =>
  str?.length > len ? str.substring(0, len) + '...' : str

export const generatePONumber = () =>
  'PO-' + Date.now().toString().slice(-8)

export const generateInvoiceNumber = () =>
  'INV-' + Date.now().toString().slice(-8)
