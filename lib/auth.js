// lib/auth.js - SUPABASE AUTH MET SUPER ADMIN EN getIdToken
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import supabase from "@/lib/supabase"
import { useRouter } from 'next/router'

// SUPER ADMIN configuratie
const SUPER_ADMIN_EMAIL = 'o.amatiskak@sterkbouw.nl';
const SUPER_ADMIN_NAME = 'O. Amatiskak';

// Permissies hiërarchie
const PERMISSIONS = {
  SUPER_ADMIN: {
    canViewAllProjects: true,
    canEditAllProjects: true,
    canDeleteProjects: true,
    canManageUsers: true,
    canApproveQuotes: true,
    canViewFinancials: true,
    canExportData: true,
    canManageSettings: true,
    canAccessAuditLogs: true,
    canBypassRLS: true,
    canImpersonate: true,
    canManageSystem: true
  },
  admin: {
    canViewAllProjects: true,
    canEditAllProjects: true,
    canDeleteProjects: true,
    canManageUsers: true,
    canApproveQuotes: true,
    canViewFinancials: true,
    canExportData: true,
    canManageSettings: true,
    canAccessAuditLogs: true,
    canBypassRLS: false,
    canImpersonate: false,
    canManageSystem: false
  },
  project_leader: {
    canViewAllProjects: false,
    canEditAllProjects: false,
    canDeleteProjects: false,
    canManageUsers: false,
    canApproveQuotes: true,
    canViewFinancials: true,
    canExportData: true,
    canManageSettings: false,
    canAccessAuditLogs: false,
    canBypassRLS: false,
    canImpersonate: false,
    canManageSystem: false
  },
  client: {
    canViewAllProjects: false,
    canEditAllProjects: false,
    canDeleteProjects: false,
    canManageUsers: false,
    canApproveQuotes: true,
    canViewFinancials: false,
    canExportData: true,
    canManageSettings: false,
    canAccessAuditLogs: false,
    canBypassRLS: false,
    canImpersonate: false,
    canManageSystem: false
  }
};

// Auth context
const AuthContext = createContext(null)

// Helper: Check of gebruiker Super Admin is
const isSuperAdmin = (email) => {
  return email === SUPER_ADMIN_EMAIL;
};

// Helper: Haal permissies op voor gebruiker
const getUserPermissions = (userRole, userEmail) => {
  if (isSuperAdmin(userEmail)) {
    return {
      ...PERMISSIONS.SUPER_ADMIN,
      role: 'SUPER_ADMIN',
      isSuperAdmin: true
    };
  }
  
  return {
    ...PERMISSIONS[userRole] || PERMISSIONS.client,
    role: userRole,
    isSuperAdmin: false
  };
};

// Helper: Haal gebruikersprofiel op uit database
const fetchUserProfile = async (userId, userEmail) => {
  try {
    // Eerst controleren of dit de SUPER_ADMIN is
    if (isSuperAdmin(userEmail)) {
      return {
        id: userId,
        email: userEmail,
        full_name: SUPER_ADMIN_NAME,
        role: 'SUPER_ADMIN',
        is_active: true,
        avatar_url: null,
        phone_number: null,
        company_name: 'SterkBouw',
        last_login: new Date().toISOString(),
        isSuperAdmin: true,
        permissions: PERMISSIONS.SUPER_ADMIN
      };
    }

    // Voor normale gebruikers: haal profiel uit database
    const { data: profile, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        full_name,
        role,
        is_active,
        avatar_url,
        phone_number,
        company_name,
        last_login,
        notification_preferences
      `)
      .eq('id', userId)
      .eq('is_active', true)
      .single();

    if (error || !profile) {
      console.warn('User profile not found, using default:', error?.message);
      return {
        id: userId,
        email: userEmail,
        full_name: userEmail.split('@')[0],
        role: 'client',
        is_active: true,
        isSuperAdmin: false,
        permissions: PERMISSIONS.client
      };
    }

    return {
      ...profile,
      isSuperAdmin: false,
      permissions: getUserPermissions(profile.role, userEmail)
    };

  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const router = useRouter();

  // ==========================================
  // NIEUW: getIdToken functie voor API calls
  // ==========================================
  const getIdToken = useCallback(async () => {
    try {
      // Haal huidige sessie op
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (!currentSession?.access_token) {
        console.warn('No access token found in session');
        return null;
      }
      
      return currentSession.access_token;
    } catch (error) {
      console.error('Error getting ID token:', error);
      return null;
    }
  }, []);

  // ==========================================
  // NIEUW: Refresh token functie
  // ==========================================
  const refreshToken = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Error refreshing token:', error);
        return null;
      }
      
      if (data.session) {
        setSession(data.session);
        return data.session.access_token;
      }
      
      return null;
    } catch (error) {
      console.error('Refresh token error:', error);
      return null;
    }
  }, []);

  // ==========================================
  // NIEUW: API helper met geïntegreerde token
  // ==========================================
  const apiCall = useCallback(async (url, options = {}) => {
    try {
      const token = await getIdToken();
      
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      const defaultOptions = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };
      
      const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
          ...defaultOptions.headers,
          ...options.headers
        }
      };
      
      const response = await fetch(url, mergedOptions);
      
      // Als 401, probeer token te refreshen
      if (response.status === 401) {
        const newToken = await refreshToken();
        
        if (newToken) {
          // Voeg nieuwe token toe en probeer opnieuw
          mergedOptions.headers.Authorization = `Bearer ${newToken}`;
          const retryResponse = await fetch(url, mergedOptions);
          return retryResponse;
        }
      }
      
      return response;
    } catch (error) {
      console.error('API call error:', error);
      throw error;
    }
  }, [getIdToken, refreshToken]);

  // Update user profile in database
  const updateUserProfile = useCallback(async (userId, updates) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setUserProfile(prev => ({
          ...prev,
          ...data,
          permissions: getUserPermissions(data.role, data.email)
        }));
      }

      return { success: true, data };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error };
    }
  }, []);

  // Login met extra profiling
  const signInWithEmail = async (email, password) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });

      if (error) throw error;

      if (data.user) {
        // SUPER ADMIN check
        const isAdmin = isSuperAdmin(email);
        
        if (isAdmin) {
          console.log('🔐 SUPER ADMIN logged in:', email);
          
          // SUPER ADMIN profiel maken
          const superAdminProfile = {
            id: data.user.id,
            email: email,
            full_name: SUPER_ADMIN_NAME,
            role: 'SUPER_ADMIN',
            is_active: true,
            avatar_url: null,
            phone_number: null,
            company_name: 'SterkBouw',
            last_login: new Date().toISOString(),
            isSuperAdmin: true,
            permissions: PERMISSIONS.SUPER_ADMIN
          };

          setUserProfile(superAdminProfile);

          // Update last login in database voor SUPER_ADMIN
          try {
            await supabase
              .from('users')
              .upsert({
                id: data.user.id,
                email: email,
                full_name: SUPER_ADMIN_NAME,
                role: 'SUPER_ADMIN',
                is_active: true,
                last_login: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }, {
                onConflict: 'email'
              });
          } catch (dbError) {
            console.warn('Could not update SUPER_ADMIN in database:', dbError);
          }

        } else {
          // Normale gebruiker: haal profiel op
          const profile = await fetchUserProfile(data.user.id, email);
          setUserProfile(profile);
        }
      }

      return { success: true, data };
    } catch (error) {
      console.error('Sign in error:', error);
      return { 
        success: false, 
        error: error.message || 'Login mislukt' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Uitgebreide signOut
  const signOut = async () => {
    try {
      // Log uit bij Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Reset local state
      setUser(null);
      setUserProfile(null);
      setSession(null);

      // Redirect naar login
      router.push('/login');
      
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message };
    }
  };

  // Wachtwoord reset voor SUPER_ADMIN (kan alle gebruikers resetten)
  const resetPasswordForUser = async (targetEmail, isSuperAdminRequest = false) => {
    try {
      const currentUser = userProfile;
      
      // Alleen SUPER_ADMIN kan andere gebruikers resetten
      if (isSuperAdminRequest && !currentUser?.isSuperAdmin) {
        return { 
          success: false, 
          error: 'Alleen SUPER_ADMIN kan wachtwoorden van andere gebruikers resetten' 
        };
      }

      const { data, error } = await supabase.auth.resetPasswordForEmail(targetEmail, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, error: error.message };
    }
  };

  // Impersonate functionaliteit (alleen voor SUPER_ADMIN)
  const impersonateUser = async (targetUserId) => {
    try {
      if (!userProfile?.isSuperAdmin) {
        return { 
          success: false, 
          error: 'Alleen SUPER_ADMIN kan impersonate gebruiken' 
        };
      }

      // Haal target user profiel op
      const { data: targetProfile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', targetUserId)
        .single();

      if (error || !targetProfile) {
        throw new Error('Gebruiker niet gevonden');
      }

      // Sla originele user op in session storage
      sessionStorage.setItem('originalUser', JSON.stringify(userProfile));
      sessionStorage.setItem('isImpersonating', 'true');

      // Update local state met geïmperisonate gebruiker
      setUserProfile({
        ...targetProfile,
        isImpersonating: true,
        originalUserId: userProfile.id,
        permissions: getUserPermissions(targetProfile.role, targetProfile.email)
      });

      return { 
        success: true, 
        user: targetProfile,
        message: `Je bent nu ingelogd als ${targetProfile.full_name || targetProfile.email}`
      };
    } catch (error) {
      console.error('Impersonate error:', error);
      return { success: false, error: error.message };
    }
  };

  // Stop met impersonaten
  const stopImpersonating = async () => {
    try {
      const originalUser = JSON.parse(sessionStorage.getItem('originalUser'));
      
      if (!originalUser) {
        throw new Error('Geen originele gebruiker gevonden');
      }

      // Herstel originele user
      sessionStorage.removeItem('originalUser');
      sessionStorage.removeItem('isImpersonating');

      setUserProfile({
        ...originalUser,
        isImpersonating: false,
        originalUserId: null
      });

      return { success: true };
    } catch (error) {
      console.error('Stop impersonating error:', error);
      return { success: false, error: error.message };
    }
  };

  // Check permission helper
  const hasPermission = (permission) => {
    if (!userProfile) return false;
    
    // SUPER_ADMIN heeft altijd alle permissies
    if (userProfile.isSuperAdmin) return true;
    
    return userProfile.permissions?.[permission] || false;
  };

  // Initialize auth
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // 1. Huidige sessie ophalen
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (sessionError) {
          console.error("Auth session error:", sessionError);
          setLoading(false);
          return;
        }

        setSession(currentSession);
        const currentUser = currentSession?.user;
        setUser(currentUser);

        // 2. Als er een gebruiker is, haal profiel op
        if (currentUser) {
          const profile = await fetchUserProfile(currentUser.id, currentUser.email);
          
          if (mounted) {
            setUserProfile(profile);
            
            // Update last login voor niet-SUPER_ADMIN
            if (!isSuperAdmin(currentUser.email)) {
              try {
                await supabase
                  .from('users')
                  .update({ 
                    last_login: new Date().toISOString() 
                  })
                  .eq('id', currentUser.id);
              } catch (updateError) {
                console.warn('Could not update last login:', updateError);
              }
            }
          }
        }

        if (mounted) {
          setLoading(false);
        }

      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // 3. Luisteren naar auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;

        setSession(newSession);
        const currentUser = newSession?.user;
        setUser(currentUser);

        if (currentUser) {
          const profile = await fetchUserProfile(currentUser.id, currentUser.email);
          setUserProfile(profile);
        } else {
          setUserProfile(null);
        }

        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // ==========================================
  // Context value met nieuwe functies
  // ==========================================
  const value = {
    // Basis state
    user,
    userProfile,
    loading,
    session,

    // Auth acties (behouden originele Supabase methods)
    signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    signOut,
    signUp: (email, password) => supabase.auth.signUp({ email, password }),
    resetPassword: (email) => supabase.auth.resetPasswordForEmail(email),
    updatePassword: (password) => supabase.auth.updateUser({ password }),

    // Nieuwe enhanced methods
    signInWithEmail,
    resetPasswordForUser,
    updateUserProfile,
    
    // SUPER_ADMIN functionaliteit
    impersonateUser,
    stopImpersonating,
    isSuperAdmin: userProfile?.isSuperAdmin || false,
    
    // Permission checks
    hasPermission,
    can: hasPermission, // alias
    
    // Helper functies
    isImpersonating: userProfile?.isImpersonating || false,
    getOriginalUserId: () => userProfile?.originalUserId || null,
    
    // ==========================================
    // NIEUWE TOKEN FUNCTIES VOOR API CALLS
    // ==========================================
    getIdToken,          // Gebruik deze in je calculaties pagina
    refreshToken,        // Voor token refresh
    apiCall,             // Helper voor API calls met geïntegreerde auth
    
    // Backward compatibility: user.getIdToken() functie
    getCurrentUser: () => ({
      ...user,
      getIdToken: async () => {
        const token = await getIdToken();
        if (!token) throw new Error('No token available');
        return token;
      }
    })
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Helpers (origineel behouden)
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}

export async function getUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

// Nieuwe helper: Check of gebruiker SUPER_ADMIN is
export function isUserSuperAdmin(email) {
  return email === SUPER_ADMIN_EMAIL;
}

// Nieuwe helper: Haal SUPER_ADMIN email op
export function getSuperAdminEmail() {
  return SUPER_ADMIN_EMAIL;
}

// Nieuwe helper: SUPER_ADMIN login helper
export async function superAdminLogin() {
  // Dit is een helper voor development/testing
  // In productie zou je dit nooit zo doen!
  if (process.env.NODE_ENV === 'development') {
    console.warn('⚠️ SUPER_ADMIN login helper alleen voor development!');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: SUPER_ADMIN_EMAIL,
      password: 'temp_password' // Moet in .env staan
    });
    
    if (error) {
      console.error('SUPER_ADMIN login failed:', error);
      return { success: false, error };
    }
    
    return { success: true, data };
  }
  
  return { 
    success: false, 
    error: 'Alleen beschikbaar in development mode' 
  };
}
