// contexts/WebSocketContext.js
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
  useState,
} from 'react'

const WebSocketContext = createContext(null)

// eenvoudige fallback notifier (geen externe dependency)
function notify(type, message) {
  if (typeof window !== 'undefined') {
    console[type === 'error' ? 'error' : 'log'](
      `[WebSocket:${type}]`,
      message
    )
  }
}

export function WebSocketProvider({ children }) {
  const ws = useRef(null)
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState([])

  const connect = useCallback(() => {
    try {
      // DEV endpoint (zoals origineel bedoeld)
      ws.current = new WebSocket('ws://localhost:3001')

      ws.current.onopen = () => {
        setIsConnected(true)
        notify('info', 'Verbonden met real-time updates')
      }

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          setMessages(prev => [...prev, data])

          if (data?.type === 'inspection_update') {
            notify('info', `Inspectie geüpdatet: ${data.title}`)
          }
        } catch (err) {
          notify('error', 'Ongeldig WebSocket-bericht')
        }
      }

      ws.current.onclose = () => {
        setIsConnected(false)
        notify('warn', 'Verbinding verbroken')
      }

      ws.current.onerror = (error) => {
        notify('error', 'WebSocket fout')
        console.error(error)
      }
    } catch (error) {
      notify('error', 'WebSocket connectie mislukt')
      console.error(error)
    }
  }, [])

  const sendMessage = useCallback(
    (message) => {
      if (ws.current && isConnected) {
        ws.current.send(JSON.stringify(message))
      }
    },
    [isConnected]
  )

  useEffect(() => {
    connect()
    return () => {
      if (ws.current) {
        ws.current.close()
      }
    }
  }, [connect])

  return (
    <WebSocketContext.Provider
      value={{
        isConnected,
        messages,
        sendMessage,
        reconnect: connect,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  )
}

export function useWebSocket() {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider')
  }
  return context
}
