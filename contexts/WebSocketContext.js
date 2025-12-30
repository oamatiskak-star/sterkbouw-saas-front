import React, { createContext, useContext, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';

const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
const ws = useRef(null);
const [isConnected, setIsConnected] = useState(false);
const [messages, setMessages] = useState([]);

const connect = useCallback(() => {
try {
// For development, use mock. In production: wss://api.example.com/ws
ws.current = new WebSocket('ws://localhost:3001');

text
  ws.current.onopen = () => {
    setIsConnected(true);
    toast.success('Verbonden met real-time updates');
  };

  ws.current.onmessage = (event) => {
    const data = JSON.parse(event.data);
    setMessages(prev => [...prev, data]);
    
    // Show notifications for important updates
    if (data.type === 'inspection_update') {
      toast.info(`Inspectie geüpdatet: ${data.title}`);
    }
  };

  ws.current.onclose = () => {
    setIsConnected(false);
    toast.warning('Verbinding verbroken, probeer opnieuw...');
  };

  ws.current.onerror = (error) => {
    console.error('WebSocket error:', error);
    toast.error('WebSocket fout');
  };
} catch (error) {
  console.error('Connection error:', error);
}
}, []);

const sendMessage = useCallback((message) => {
if (ws.current && isConnected) {
ws.current.send(JSON.stringify(message));
}
}, [isConnected]);

useEffect(() => {
connect();
return () => {
if (ws.current) {
ws.current.close();
}
};
}, [connect]);

return (
<WebSocketContext.Provider value={{
isConnected,
messages,
sendMessage,
reconnect: connect,
}}>
{children}
</WebSocketContext.Provider>
);
};

export const useWebSocket = () => {
const context = useContext(WebSocketContext);
if (!context) throw new Error('useWebSocket must be used within WebSocketProvider');
return context;
  };
