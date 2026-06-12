import { createContext, useContext, useState } from 'react'

const AppContext = createContext()

export const AppProvider = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [notifications, setNotifications] = useState([])

  const toggleSidebar = () => setSidebarOpen(prev => !prev)

  const addNotification = (msg, type = 'info') => {
    const id = Date.now()
    setNotifications(prev => [...prev, { id, msg, type }])
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 4000)
  }

  return (
    <AppContext.Provider value={{ sidebarOpen, toggleSidebar, notifications, addNotification }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
