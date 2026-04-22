import React from 'react';
import { Route } from 'react-router-dom';
import AuthGuard from './AuthGuard';
import { UserRole } from '../../types';

interface RoleBasedRouteProps {
  path: string;
  element: React.ReactElement;
  allowedRoles: UserRole[];
  requireAuth?: boolean;
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({
  path,
  element,
  allowedRoles,
  requireAuth = true,
}) => {
  return (
    <Route
      path={path}
      element={
        <AuthGuard allowedRoles={allowedRoles} requireAuth={requireAuth}>
          {element}
        </AuthGuard>
      }
    />
  );
};

export default RoleBasedRoute;
