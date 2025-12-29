// contexts/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Simuleer auth check - vervang met Supabase auth
    const checkAuth = async () => {
      try {
        // Mock user data
        const mockUser = {
          id: 1,
          name: 'Jan Visser',
          email: 'jan@sterkbouw.nl',
          role: 'uitvoerder',
          company: 'Sterkbouw B.V.',
          avatar: 'JV',
          phone: '+31612345678',
          permissions: [
            'view_dashboard',
            'manage_projects',
            'view_finances',
            'manage_team',
            'approve_invoices',
            'generate_reports'
          ],
          settings: {
            language: 'nl',
            theme: 'light',
            notifications: true
          }
        }
        
        // Simuleer network delay
        setTimeout(() => {
          setUser(mockUser)
          setLoading(false)
        }, 500)
        
      } catch (error) {
        console.error('Auth check failed:', error)
        setUser(null)
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email, password) => {
    try {
      setLoading(true)
      
      // Mock login - vervang met Supabase auth
      const mockUser = {
        id: 1,
        name: 'Jan Visser',
        email: email,
        role: 'uitvoerder',
        avatar: 'JV',
        permissions: ['view_dashboard', 'manage_projects']
      }
      
      // Simuleer API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setUser(mockUser)
      toast.success('Succesvol ingelogd!')
      
      // Redirect naar dashboard
      router.push('/dashboard')
      
      return { success: true, user: mockUser }
    } catch (error) {
      toast.error('Login mislukt. Controleer je gegevens.')
      return { success: false, error: 'Login mislukt' }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      
      // Simuleer logout
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setUser(null)
      toast.success('Succesvol uitgelogd')
      
      // Redirect naar login
      router.push('/login')
    } catch (error) {
      toast.error('Uitloggen mislukt')
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (data) => {
    try {
      // Simuleer update
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setUser(prev => ({ ...prev, ...data }))
      toast.success('Profiel bijgewerkt')
      
      return { success: true }
    } catch (error) {
      toast.error('Profiel bijwerken mislukt')
      return { success: false, error }
    }
  }

  const hasPermission = (permission) => {
    if (!user) return false
    return user.permissions?.includes(permission) || false
  }

  const isAdmin = () => {
    return user?.role === 'admin' || user?.role === 'uitvoerder'
  }

  const value = {
    user,
    loading,
    login,
    logout,
    updateProfile,
    hasPermission,
    isAdmin,
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
