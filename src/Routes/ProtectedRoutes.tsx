import React from 'react';
import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { AuthContext } from '../Context/AuthContext';

interface AdminRouteProps {
  children: ReactNode;
  permission: string;
}

const AdminRoute = ({ children, permission }: AdminRouteProps) => {
  const context = React.useContext(AuthContext);
  const loggeduser = context?.loggeduser;

  if (!loggeduser) {
    // Not logged in → redirect to login/home
    return <Navigate to="/" replace />;
  }

  if (!loggeduser.permissions?.includes(permission)) {
    // Has no permission → redirect somewhere safe
    return <Navigate to="/admin/admission_dashboard" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;