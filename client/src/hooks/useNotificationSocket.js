import { useEffect, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export const useNotificationSocket = (onNotification) => {
  const socketRef = useRef(null)
  const onNotificationRef = useRef(onNotification)
  const { user, token } = useAuth()
  const { addToast } = useToast()

  // Keep the latest callback in a ref so we don't need to add it to the dependency array
  useEffect(() => {
    onNotificationRef.current = onNotification
  }, [onNotification])

  useEffect(() => {
    if (!user || !token) return

    // Connect to Socket.io server
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    })

    socket.on('connect', () => {
      console.log('[Socket] Connected to notification server')
      addToast('Connected to notifications', 'success')
    })

    socket.on('connected', (data) => {
      console.log('[Socket] Server confirmation:', data)
    })

    socket.on('notification', (notification) => {
      console.log('[Socket] Received notification:', notification)
      
      // Show toast popup for real-time notification
      addToast(
        `${notification.title}: ${notification.message}`,
        notification.type === 'approval' ? 'info' : 'info'
      )

      // Call parent callback if provided
      if (onNotificationRef.current) {
        onNotificationRef.current(notification)
      }
    })

    socket.on('disconnect', () => {
      console.log('[Socket] Disconnected from notification server')
    })

    socket.on('error', (error) => {
      console.error('[Socket] Error:', error)
    })

    socketRef.current = socket

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [user, token, addToast])

  return socketRef
}

export default useNotificationSocket
