import React, { createContext, useContext, useState, useEffect } from 'react';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const [ws, setWs] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Simuleer WebSocket verbinding voor nu
    // In productie, vervang dit door echte WebSocket verbinding
    const simulateConnection = () => {
      setTimeout(() => {
        setIsConnected(true);
        console.log('WebSocket verbinding gesimuleerd');
      }, 1000);
    };

    simulateConnection();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  const value = {
    ws,
    isConnected,
    sendMessage: (message) => {
      console.log('Bericht verzonden:', message);
      // In productie: ws.send(JSON.stringify(message))
    }
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }
  return context;
};
