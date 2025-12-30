// hooks/useNotifications.js
import { useState, useEffect, useCallback } from 'react';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Mock data
  const mockNotifications = [
    {
      id: 1,
      title: 'Nieuwe prijsaanvraag',
      message: 'Prijsaanvraag voor betonfundering is verzonden',
      timestamp: '2024-01-30T10:30:00',
      read: false,
      type: 'info'
    },
    {
      id: 2,
      title: 'Offerte ontvangen',
      message: 'Bouwmateriaal BV heeft geoffreerd',
      timestamp: '2024-01-30T09:15:00',
      read: true,
      type: 'success'
    }
  ];

  useEffect(() => {
    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  const addNotification = useCallback((notification) => {
    setNotifications(prev => [notification, ...prev]);
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    addNotification
  };
};

export default useNotifications;
