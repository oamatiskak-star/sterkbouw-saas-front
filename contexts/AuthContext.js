// contexts/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/router'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Simuleer auth check - vervang met echte auth logica
    const checkAuth = async () => {
      try {
        // Hier zou je een API call doen om de user te valideren
        const mockUser = {
          id: 1,
          name: 'Jan Visser',
          email: 'jan@sterkbouw.nl',
          role: 'uitvoerder',
          avatar: 'JV',
          permissions: ['view_projects', 'edit_projects', 'view_finances']
        }
        
        setUser(mockUser)
      } catch (error) {
        console.error('Auth check failed:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email, password) => {
    // Simuleer login - vervang met echte API call
    try {
      setLoading(true)
      
      // Mock login
      const mockUser = {
        id: 1,
        name: 'Jan Visser',
        email: email,
        role: 'uitvoerder',
        avatar: 'JV',
        permissions: ['view_projects', 'edit_projects', 'view_finances']
      }
      
      setUser(mockUser)
      
      // Redirect naar dashboard
      router.push('/dashboard')
      
      return { success: true, user: mockUser }
    } catch (error) {
      return { success: false, error: 'Login mislukt' }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    // Simuleer logout
    setUser(null)
    router.push('/login')
  }

  const hasPermission = (permission) => {
    if (!user) return false
    return user.permissions?.includes(permission) || false
  }

  const value = {
    user,
    loading,
    login,
    logout,
    hasPermission,
    isAuthenticated: !!user
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
