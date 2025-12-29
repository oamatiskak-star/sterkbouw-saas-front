import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(false)
  const router = useRouter()

  // Check active session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          setUser(session.user)
          
          // Fetch user profile
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
            
          if (userProfile) {
            setProfile(userProfile)
          }
        }
      } catch (error) {
        console.error('Session check failed:', error)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          
          // Fetch user profile on auth state change
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
            
          if (userProfile) {
            setProfile(userProfile)
          } else {
            // Create profile if it doesn't exist
            await createProfile(session.user)
          }
        } else {
          setUser(null)
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const createProfile = async (userData) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([
          {
            id: userData.id,
            email: userData.email,
            full_name: userData.user_metadata?.full_name || '',
            role: userData.user_metadata?.role || 'medewerker',
            company: userData.user_metadata?.company || '',
            phone: userData.user_metadata?.phone || '',
            avatar_url: userData.user_metadata?.avatar_url || '',
            settings: {
              language: 'nl',
              theme: 'light',
              notifications: true,
              email_notifications: true
            },
            permissions: getDefaultPermissions(userData.user_metadata?.role)
          }
        ])
        .select()
        .single()

      if (error) throw error
      setProfile(data)
      return data
    } catch (error) {
      console.error('Profile creation failed:', error)
      return null
    }
  }

  const getDefaultPermissions = (role) => {
    const permissions = {
      admin: [
        'view_dashboard',
        'manage_projects',
        'manage_users',
        'view_finances',
        'manage_finances',
        'manage_team',
        'approve_invoices',
        'generate_reports',
        'system_settings'
      ],
      uitvoerder: [
        'view_dashboard',
        'manage_projects',
        'view_finances',
        'manage_team',
        'approve_invoices',
        'generate_reports'
      ],
      calculator: [
        'view_dashboard',
        'manage_projects',
        'create_calculations',
        'view_finances'
      ],
      medewerker: [
        'view_dashboard',
        'view_projects',
        'create_reports'
      ]
    }
    
    return permissions[role] || permissions.medewerker
  }

  const login = async (email, password, rememberMe = false) => {
    try {
      setAuthLoading(true)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Ongeldige inloggegevens')
        }
        throw error
      }

      if (data?.user) {
        setUser(data.user)
        
        // Fetch user profile
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()
          
        if (userProfile) {
          setProfile(userProfile)
        }
        
        toast.success('Succesvol ingelogd!')
        
        // Redirect based on role or last visited page
        const returnTo = router.query.returnTo || '/dashboard'
        router.push(returnTo)
      }

      return { success: true, user: data.user }
    } catch (error) {
      console.error('Login error:', error)
      toast.error(error.message || 'Login mislukt. Controleer je gegevens.')
      return { success: false, error: error.message }
    } finally {
      setAuthLoading(false)
    }
  }

  const signup = async (email, password, userData) => {
    try {
      setAuthLoading(true)
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name,
            role: userData.role,
            company: userData.company,
            phone: userData.phone
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        if (error.message.includes('User already registered')) {
          throw new Error('Dit emailadres is al geregistreerd')
        }
        throw error
      }

      if (data?.user) {
        toast.success('Account aangemaakt! Controleer je email voor verificatie.')
        return { success: true, user: data.user, requiresConfirmation: true }
      }

      return { success: false, error: 'Registratie mislukt' }
    } catch (error) {
      console.error('Signup error:', error)
      toast.error(error.message || 'Registratie mislukt')
      return { success: false, error: error.message }
    } finally {
      setAuthLoading(false)
    }
  }

  const logout = async () => {
    try {
      setAuthLoading(true)
      
      const { error } = await supabase.auth.signOut()
      
      if (error) throw error
      
      setUser(null)
      setProfile(null)
      
      toast.success('Succesvol uitgelogd')
      
      // Redirect to login page
      router.push('/login')
      
      return { success: true }
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Uitloggen mislukt')
      return { success: false, error: error.message }
    } finally {
      setAuthLoading(false)
    }
  }

  const updateProfile = async (profileData) => {
    try {
      if (!user) throw new Error('Geen gebruiker gevonden')
      
      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error
      
      setProfile(data)
      toast.success('Profiel bijgewerkt')
      
      return { success: true, profile: data }
    } catch (error) {
      console.error('Profile update error:', error)
      toast.error('Profiel bijwerken mislukt')
      return { success: false, error: error.message }
    }
  }

  const updatePassword = async (currentPassword, newPassword) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error
      
      toast.success('Wachtwoord succesvol gewijzigd')
      return { success: true }
    } catch (error) {
      console.error('Password update error:', error)
      toast.error('Wachtwoord wijzigen mislukt')
      return { success: false, error: error.message }
    }
  }

  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })

      if (error) throw error
      
      toast.success('Reset link verzonden naar je email')
      return { success: true }
    } catch (error) {
      console.error('Password reset error:', error)
      toast.error('Wachtwoord reset mislukt')
      return { success: false, error: error.message }
    }
  }

  const hasPermission = (permission) => {
    if (!profile) return false
    return profile.permissions?.includes(permission) || false
  }

  const isRole = (role) => {
    if (!profile) return false
    return profile.role === role
  }

  const isAdmin = () => {
    return profile?.role === 'admin' || profile?.role === 'uitvoerder'
  }

  const canAccess = (requiredPermission) => {
    if (!profile) return false
    if (profile.role === 'admin') return true
    return hasPermission(requiredPermission)
  }

  const getUserFullName = () => {
    return profile?.full_name || user?.email?.split('@')[0] || 'Gebruiker'
  }

  const getUserInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    }
    return user?.email?.substring(0, 2).toUpperCase() || 'US'
  }

  const value = {
    // State
    user,
    profile,
    loading,
    authLoading,
    
    // Auth methods
    login,
    signup,
    logout,
    updateProfile,
    updatePassword,
    resetPassword,
    
    // Permission checks
    hasPermission,
    isRole,
    isAdmin,
    canAccess,
    
    // User info
    getUserFullName,
    getUserInitials,
    
    // Convenience
    isAuthenticated: !!user,
    userRole: profile?.role || null,
    userPermissions: profile?.permissions || []
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
