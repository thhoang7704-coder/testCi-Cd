import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserRole } from '../../types';
import Loading from '../Loading';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
}

const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  allowedRoles = [],
  requireAuth = true,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuth } = useSelector((state: any) => state.auth);

  useEffect(() => {
    if (requireAuth && !isAuth) {
      // Redirect to login if authentication is required but user is not authenticated
      navigate('/', { state: { from: location } });
      return;
    }

    if (isAuth && allowedRoles.length > 0 && user?.role) {
      // Check if user has required role
      if (!allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on role
        const roleRoutes = {
          SYSTEM_ADMIN: '/system-admin/dashboard',
          LAB_ADMIN: '/lab-admin/dashboard',
          COMPANY: '/enterprise/dashboard',
          MENTOR: '/mentor/dashboard',
          TALENT: '/candidate/dashboard',
          TALENT_LEADER: '/candidate/dashboard',
        };

        const redirectPath = roleRoutes[user.role as keyof typeof roleRoutes] || '/';
        navigate(redirectPath, { replace: true });
        return;
      }
    }

    if (!requireAuth && isAuth) {
      // If authentication is not required but user is authenticated, redirect to their dashboard
      const roleRoutes = {
        SYSTEM_ADMIN: '/system-admin/dashboard',
        LAB_ADMIN: '/lab-admin/dashboard',
        COMPANY: '/enterprise/dashboard',
        MENTOR: '/mentor/dashboard',
        TALENT: '/candidate/dashboard',
        TALENT_LEADER: '/candidate/dashboard',
      };

      const redirectPath = roleRoutes[user?.role as keyof typeof roleRoutes] || '/dashboard';
      navigate(redirectPath, { replace: true });
      return;
    }
  }, [isAuth, user, allowedRoles, requireAuth, navigate, location]);

  // Show loading while checking authentication
  if (requireAuth && !isAuth) {
    return <Loading />;
  }

  // Show loading while checking roles
  if (isAuth && allowedRoles.length > 0 && !user) {
    return <Loading />;
  }

  // If role check fails, component will redirect, so don't render children
  if (isAuth && allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return <Loading />;
  }

  return <>{children}</>;
};

export default AuthGuard;
