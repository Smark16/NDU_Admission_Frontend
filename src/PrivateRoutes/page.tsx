import { Navigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../Context/AuthContext";
import type { ReactNode, JSX } from "react";

// Define props type
interface PrivateRouteProps {
  children: ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps): JSX.Element => {
  const context = useContext(AuthContext);

  // Ensure context exists (throw in dev if not wrapped)
  if (!context) {
    throw new Error("PrivateRoute must be used within AuthProvider");
  }

  const { loggeduser } = context;
  const location = useLocation();

  // If not logged in → save current path and redirect to login
  if (!loggeduser) {
    const pathToSave = `${location.pathname}${location.search}`;
    localStorage.setItem("lastPath", pathToSave);
    return <Navigate to="/" replace />;
  }

  // If logged in → render children
  return <>{children}</>;
};

export default PrivateRoute;