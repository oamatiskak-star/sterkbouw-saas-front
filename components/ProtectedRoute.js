// Frontend/components/ProtectedRoute.js
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/auth';
import LoadingSpinner from './LoadingSpinner';

/**
 * ProtectedRoute - Beveiligde route wrapper
 * 
 * Types:
 * 1. auth: Alleen ingelogde gebruikers (default)
 * 2. guest: Alleen niet-ingelogde gebruikers (bv. login pagina)
 * 3. role: Specifieke rol vereist (bv. 'admin', 'project_leader')
 * 4. permission: Specifieke permissie vereist (bv. 'canViewFinancials')
 * 5. superAdmin: Alleen SUPER_ADMIN
 */

const ProtectedRoute = ({
  children,
  type = 'auth', // 'auth' | 'guest' | 'role' | 'permission' | 'superAdmin'
  requiredRole = null,
  requiredPermission = null,
  requiredRoles = [], // Array van toegestane rollen
  requiredPermissions = [], // Array van vereiste permissies
  redirectTo = '/login',
  unauthorizedRedirect = '/unauthorized',
  loadingComponent = <LoadingSpinner />,
  showUnauthorizedMessage = true,
  logAccessAttempt = true
}) => {
  const router = useRouter();
  const { user, userProfile, loading, isSuperAdmin, hasPermission } = useAuth();
  const isAuthenticated = !!user;
  const currentRole = userProfile?.role;
  const currentPermissions = userProfile?.permissions || {};

  // Log access attempts voor SUPER_ADMIN monitoring
  useEffect(() => {
    if (logAccessAttempt && !loading && userProfile) {
      const logData = {
        path: router.pathname,
        userEmail: userProfile.email,
        userRole: currentRole,
        isSuperAdmin,
        timestamp: new Date().toISOString(),
        accessType: type
      };

      // Log alleen in development of voor SUPER_ADMIN acties
      if (process.env.NODE_ENV === 'development' || isSuperAdmin) {
        console.log('🔒 Route Access Check:', logData);
      }

      // SUPER_ADMIN access logging naar server (optioneel)
      if (isSuperAdmin && process.env.NODE_ENV === 'production') {
        fetch('/api/log/admin-access', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(logData)
        }).catch(() => {/* silent fail */});
      }
    }
  }, [loading, userProfile, router.pathname, type, isSuperAdmin, currentRole, logAccessAttempt]);

  // Render loading state
  if (loading) {
    return loadingComponent;
  }

  // Helper functies voor toegangscontrole
  const hasRequiredRole = () => {
    if (requiredRoles.length > 0) {
      return requiredRoles.includes(currentRole) || isSuperAdmin;
    }
    return requiredRole ? (currentRole === requiredRole || isSuperAdmin) : true;
  };

  const hasRequiredPermissions = () => {
    if (requiredPermissions.length > 0) {
      return requiredPermissions.every(perm => hasPermission(perm)) || isSuperAdmin;
    }
    return requiredPermission ? (hasPermission(requiredPermission) || isSuperAdmin) : true;
  };

  const canAccess = () => {
    switch (type) {
      case 'guest':
        // Alleen toegang voor niet-ingelogde gebruikers
        return !isAuthenticated;

      case 'role':
        // Specifieke rol vereist
        return isAuthenticated && hasRequiredRole();

      case 'permission':
        // Specifieke permissie vereist
        return isAuthenticated && hasRequiredPermissions();

      case 'superAdmin':
        // Alleen SUPER_ADMIN
        return isAuthenticated && isSuperAdmin;

      case 'auth':
      default:
        // Alleen ingelogde gebruikers
        return isAuthenticated;
    }
  };

  // Redirect logica
  useEffect(() => {
    if (!loading) {
      const shouldRedirect = !canAccess();
      
      if (shouldRedirect) {
        let redirectPath = redirectTo;
        
        // Bepaal redirect pad op basis van toegangstype
        if (type === 'guest' && isAuthenticated) {
          // Ingelogde gebruiker probeert guest-only pagina te bereiken
          redirectPath = '/dashboard';
        } else if ((type === 'role' || type === 'permission' || type === 'superAdmin') && isAuthenticated) {
          // Ingelogd maar niet geautoriseerd
          redirectPath = unauthorizedRedirect;
        }

        // Voorkom infinite redirect loop
        if (router.pathname !== redirectPath) {
          router.push(redirectPath);
        }
      }
    }
  }, [loading, isAuthenticated, currentRole, hasPermission, router, type, redirectTo, unauthorizedRedirect, canAccess]);

  // Toon unauthorized message indien gewenst
  if (!canAccess() && showUnauthorizedMessage && isAuthenticated) {
    return (
      <div className="unauthorized-container">
        <div className="unauthorized-content">
          <h1>🚫 Toegang Geweigerd</h1>
          <p>Je hebt geen toegang tot deze pagina.</p>
          
          {type === 'superAdmin' && (
            <div className="super-admin-required">
              <h3>🔐 SUPER_ADMIN Vereist</h3>
              <p>Deze functionaliteit is alleen beschikbaar voor de systeembeheerder.</p>
              <p className="admin-contact">
                Neem contact op met: <strong>o.amatiskak@sterkbouw.nl</strong>
              </p>
            </div>
          )}

          {type === 'role' && requiredRole && (
            <div className="role-required">
              <h3>👥 Rol Vereist</h3>
              <p>Vereiste rol: <strong>{requiredRole}</strong></p>
              <p>Jouw rol: <strong>{currentRole}</strong></p>
            </div>
          )}

          {type === 'permission' && requiredPermission && (
            <div className="permission-required">
              <h3>🔑 Permissie Vereist</h3>
              <p>Vereiste permissie: <strong>{requiredPermission}</strong></p>
              <p>Jouw rol: <strong>{currentRole}</strong></p>
            </div>
          )}

          <div className="action-buttons">
            <button onClick={() => router.push('/dashboard')} className="btn-primary">
              Naar Dashboard
            </button>
            
            {isSuperAdmin && (
              <button 
                onClick={() => router.push('/admin')} 
                className="btn-admin"
              >
                🚀 SUPER_ADMIN Panel
              </button>
            )}
          </div>

          {/* Debug info voor development en SUPER_ADMIN */}
          {(process.env.NODE_ENV === 'development' || isSuperAdmin) && (
            <div className="debug-info">
              <h4>Debug Informatie:</h4>
              <ul>
                <li>Gebruiker: {userProfile?.email}</li>
                <li>Rol: {currentRole}</li>
                <li>SUPER_ADMIN: {isSuperAdmin ? '✅' : '❌'}</li>
                <li>Type check: {type}</li>
                {requiredRole && <li>Vereiste rol: {requiredRole}</li>}
                {requiredPermission && <li>Vereiste permissie: {requiredPermission}</li>}
                <li>Path: {router.pathname}</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Toon kinderen als toegang is verleend
  return canAccess() ? <>{children}</> : null;
};

// Higher-Order Component versie voor class components
export const withProtectedRoute = (WrappedComponent, options = {}) => {
  return function WithProtectedRoute(props) {
    return (
      <ProtectedRoute {...options}>
        <WrappedComponent {...props} />
      </ProtectedRoute>
    );
  };
};

// Specifieke route wrapper helpers
export const AuthRoute = (props) => (
  <ProtectedRoute type="auth" {...props} />
);

export const GuestRoute = (props) => (
  <ProtectedRoute type="guest" {...props} />
);

export const RoleRoute = ({ role, ...props }) => (
  <ProtectedRoute type="role" requiredRole={role} {...props} />
);

export const SuperAdminRoute = (props) => (
  <ProtectedRoute type="superAdmin" {...props} />
);

export const PermissionRoute = ({ permission, ...props }) => (
  <ProtectedRoute type="permission" requiredPermission={permission} {...props} />
);

// Multi-role wrapper
export const MultiRoleRoute = ({ roles = [], ...props }) => (
  <ProtectedRoute type="role" requiredRoles={roles} {...props} />
);

// Multi-permission wrapper
export const MultiPermissionRoute = ({ permissions = [], ...props }) => (
  <ProtectedRoute type="permission" requiredPermissions={permissions} {...props} />
);

export default ProtectedRoute;
