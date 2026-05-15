import React from 'react';
import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { AuthContext } from '../Context/AuthContext';

interface AdminRouteProps {
  children: ReactNode;
  /** Single permission, or any one of several (OR). */
  permission: string | string[];
  /**
   * When true, allow any authenticated staff user who is not an applicant.
   * Matches backend `CanViewAdmissionQueues` fallback for legacy permission sync gaps.
   */
  allowStaffNonApplicant?: boolean;
}

function userHasPermission(userPerms: string[] | undefined, required: string | string[]): boolean {
  if (!userPerms?.length) return false;
  if (typeof required === "string") return userPerms.includes(required);
  return required.some((p) => userPerms.includes(p));
}

const AdminRoute = ({ children, permission, allowStaffNonApplicant }: AdminRouteProps) => {
  const context = React.useContext(AuthContext);
  const loggeduser = context?.loggeduser;

  if (!loggeduser) {
    // Not logged in → redirect to login/home
    return <Navigate to="/" replace />;
  }

  if (
    allowStaffNonApplicant &&
    loggeduser.is_staff &&
    !loggeduser.is_applicant
  ) {
    return <>{children}</>;
  }

  if (!userHasPermission(loggeduser.permissions, permission)) {
    // Has no permission → redirect somewhere safe
    return <Navigate to="/admin/admission_dashboard" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
