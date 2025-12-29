// contexts/NotificationContext.js
import { createContext, useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'

const NotificationContext = createContext({})

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(3)

  // Mock notifications
  const mockNotifications = [
    {
      id: 1,
      title: 'Nieuwe calculatie',
      message: 'Peter heeft een nieuwe calculatie ingediend voor project "De Veranda"',
      type: 'info',
      time: '10 minuten geleden',
      read: false,
      icon: 'fas fa-calculator'
    },
    {
      id: 2,
      title: 'Deadline nadert',
      message: 'Project "Zonnepark Eindhoven" deadline over 2 dagen',
      type: 'warning',
      time: '1 uur geleden',
      read: false,
      icon: 'fas fa-calendar-exclamation'
    },
    {
      id: 3,
      title: 'Betaling ontvangen',
      message: 'Factuur #2023-045 is betaald door Van der Valk Bouw',
      type: 'success',
      time: '2 uur geleden',
      read: false,
      icon: 'fas fa-euro-sign'
    },
    {
      id: 4,
      title: 'Veiligheidsmelding',
      message: 'AI heeft een veiligheidsissue gedetecteerd op bouwplaats Amsterdam',
      type: 'danger',
      time: '5 uur geleden',
      read: true,
      icon: 'fas fa-shield-alt'
    }
  ]

  useEffect(() => {
    setNotifications(mockNotifications)
    const unread = mockNotifications.filter(n => !n.read).length
    setUnreadCount(unread)
  }, [])

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      time: 'Zojuist',
      read: false,
      ...notification
    }
    
    setNotifications(prev => [newNotification, ...prev])
    setUnreadCount(prev => prev + 1)
    
    // Show toast based on type
    switch(notification.type) {
      case 'success':
        toast.success(notification.message)
        break
      case 'error':
      case 'danger':
        toast.error(notification.message)
        break
      case 'warning':
        toast(notification.message, { icon: '⚠️' })
        break
      default:
        toast(notification.message)
    }
  }

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    )
    setUnreadCount(0)
  }

  const removeNotification = (id) => {
    const notification = notifications.find(n => n.id === id)
    if (!notification?.read) {
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
    setUnreadCount(0)
  }

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll
  }

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}
