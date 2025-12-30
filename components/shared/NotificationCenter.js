import React, { useState, useEffect } from 'react';
import { Bell, Check, X, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { subscribeToNotifications } from '../../lib/notifications';

const NotificationCenter = () => {
const [notifications, setNotifications] = useState([]);
const [isOpen, setIsOpen] = useState(false);
const [unreadCount, setUnreadCount] = useState(0);

useEffect(() => {
const unsubscribe = subscribeToNotifications((newNotification) => {
setNotifications(prev => [newNotification, ...prev]);
setUnreadCount(prev => prev + 1);

text
  if (newNotification.important) {
    new Notification('Inspection App', {
      body: newNotification.message,
      icon: '/icon.png'
    });
  }
});

return unsubscribe;
}, []);

const markAsRead = (id) => {
setNotifications(prev =>
prev.map(notif =>
notif.id === id ? { ...notif, read: true } : notif
)
);
setUnreadCount(prev => Math.max(0, prev - 1));
};

const markAllAsRead = () => {
setNotifications(prev =>
prev.map(notif => ({ ...notif, read: true }))
);
setUnreadCount(0);
};

const removeNotification = (id) => {
const notification = notifications.find(n => n.id === id);
if (notification && !notification.read) {
setUnreadCount(prev => Math.max(0, prev - 1));
}
setNotifications(prev => prev.filter(n => n.id !== id));
};

const getIcon = (type) => {
switch (type) {
case 'success': return <CheckCircle className="text-green-500" />;
case 'warning': return <AlertTriangle className="text-yellow-500" />;
case 'error': return <X className="text-red-500" />;
default: return <Info className="text-blue-500" />;
}
};

return (
<div className="relative">
<button
onClick={() => setIsOpen(!isOpen)}
className="relative p-2 hover:bg-gray-100 rounded-full"
>
<Bell size={24} />
{unreadCount > 0 && (
<span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
{unreadCount}
</span>
)}
</button>

text
  {isOpen && (
    <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border z-50">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">Notifications</h3>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-500 hover:text-blue-700"
              >
                Mark all as read
              </button>
            )}
            <button onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Bell size={48} className="mx-auto mb-4 opacity-50" />
            <p>No notifications yet</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 border-b hover:bg-gray-50 ${
                !notification.read ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  <div className="mt-1">{getIcon(notification.type)}</div>
                  <div>
                    <p className="font-medium">{notification.title}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(notification.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="text-sm text-gray-400 hover:text-gray-600"
                      title="Mark as read"
                    >
                      <Check size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => removeNotification(notification.id)}
                    className="text-sm text-gray-400 hover:text-gray-600"
                    title="Dismiss"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t">
        <button
          onClick={() => setNotifications([])}
          className="w-full text-sm text-gray-500 hover:text-gray-700"
        >
          Clear all notifications
        </button>
      </div>
    </div>
  )}
</div>
);
};

export default NotificationCenter;

