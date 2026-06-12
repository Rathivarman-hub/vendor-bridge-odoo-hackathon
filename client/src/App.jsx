import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import { ToastProvider, useToast } from './context/ToastContext'
import useNotificationSocket from './hooks/useNotificationSocket'
import { useEffect, useState } from 'react'

// Auth Pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'

// App Pages
import Dashboard from './pages/dashboard/Dashboard'
import Vendors from './pages/vendors/Vendors'
import VendorForm from './pages/vendors/VendorForm'
import RFQs from './pages/rfq/RFQs'
import RFQForm from './pages/rfq/RFQForm'
import Quotations from './pages/quotations/Quotations'
import QuotationForm from './pages/quotations/QuotationForm'
import QuotationCompare from './pages/quotations/QuotationCompare'
import Approvals from './pages/approvals/Approvals'
import PurchaseOrders from './pages/orders/PurchaseOrders'
import Invoices from './pages/invoices/Invoices'
import InvoiceDetail from './pages/invoices/InvoiceDetail'
import Reports from './pages/reports/Reports'
import ActivityLogs from './pages/logs/ActivityLogs'
import UserManagement from './pages/users/UserManagement'

import ProtectedRoute from './components/ProtectedRoute'
import VendorDetail from './pages/vendors/VendorDetail'
import PurchaseOrderDetail from './pages/orders/PurchaseOrderDetail'

const PublicRoute = ({ children }) => {
  const { user } = useAuth()
  return user ? <Navigate to="/dashboard" /> : children
}

const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
    <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
    <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
    <Route path="/reset-password/:token" element={<PublicRoute><ResetPassword /></PublicRoute>} />

    {/* Private & Role Based */}
    <Route path="/dashboard" element={<ProtectedRoute roles={['admin', 'procurement_officer', 'manager', 'vendor']}><Dashboard /></ProtectedRoute>} />
    
    <Route path="/vendors" element={<ProtectedRoute roles={['admin', 'procurement_officer']}><Vendors /></ProtectedRoute>} />
    <Route path="/vendors/new" element={<ProtectedRoute roles={['admin', 'procurement_officer']}><VendorForm /></ProtectedRoute>} />
    <Route path="/vendors/edit/:id" element={<ProtectedRoute roles={['admin', 'procurement_officer']}><VendorForm /></ProtectedRoute>} />
    <Route path="/vendors/:id" element={<ProtectedRoute roles={['admin', 'procurement_officer']}><VendorDetail /></ProtectedRoute>} />
    
    <Route path="/rfqs" element={<ProtectedRoute roles={['admin', 'procurement_officer', 'vendor']}><RFQs /></ProtectedRoute>} />
    <Route path="/rfqs/new" element={<ProtectedRoute roles={['admin', 'procurement_officer']}><RFQForm /></ProtectedRoute>} />
    <Route path="/rfqs/edit/:id" element={<ProtectedRoute roles={['admin', 'procurement_officer']}><RFQForm /></ProtectedRoute>} />
    
    <Route path="/quotations" element={<ProtectedRoute roles={['admin', 'procurement_officer', 'vendor']}><Quotations /></ProtectedRoute>} />
    <Route path="/quotations/new" element={<ProtectedRoute roles={['admin', 'procurement_officer', 'vendor']}><QuotationForm /></ProtectedRoute>} />
    <Route path="/quotations/edit/:id" element={<ProtectedRoute roles={['admin', 'procurement_officer', 'vendor']}><QuotationForm /></ProtectedRoute>} />
    <Route path="/quotation-compare" element={<ProtectedRoute roles={['admin', 'procurement_officer', 'manager']}><QuotationCompare /></ProtectedRoute>} />
    
    <Route path="/approvals" element={<ProtectedRoute roles={['admin', 'manager']}><Approvals /></ProtectedRoute>} />
    
    <Route path="/purchase-orders" element={<ProtectedRoute roles={['admin', 'procurement_officer', 'vendor']}><PurchaseOrders /></ProtectedRoute>} />
    <Route path="/purchase-orders/:id" element={<ProtectedRoute roles={['admin', 'procurement_officer', 'vendor']}><PurchaseOrderDetail /></ProtectedRoute>} />

    <Route path="/invoices" element={<ProtectedRoute roles={['admin', 'procurement_officer']}><Invoices /></ProtectedRoute>} />
    <Route path="/invoices/:id" element={<ProtectedRoute roles={['admin', 'procurement_officer']}><InvoiceDetail /></ProtectedRoute>} />
    
    <Route path="/reports" element={<ProtectedRoute roles={['admin', 'manager']}><Reports /></ProtectedRoute>} />
    <Route path="/logs" element={<ProtectedRoute roles={['admin', 'manager']}><ActivityLogs /></ProtectedRoute>} />
    <Route path="/users" element={<ProtectedRoute roles={['admin']}><UserManagement /></ProtectedRoute>} />

    {/* Default */}
    <Route path="/" element={<Navigate to="/dashboard" />} />
    <Route path="*" element={<Navigate to="/dashboard" />} />
  </Routes>
)

// NotificationInitializer component to setup Socket.io connection
const NotificationInitializer = ({ children }) => {
  const { user } = useAuth()
  const [notificationReady, setNotificationReady] = useState(!user)

  // Initialize Socket.io connection
  useNotificationSocket(() => {
    setNotificationReady(true)
  })

  // Only render children when notification system is ready or user not logged in
  if (!notificationReady) return null

  return children
}

const App = () => (
  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <AuthProvider>
      <ToastProvider>
        <AppProvider>
          <NotificationInitializer>
            <AppRoutes />
          </NotificationInitializer>
        </AppProvider>
      </ToastProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
