import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { getAuthToken, getRolesFromToken } from "../utils/auth";

const LabAdminRoute = () => {
  const { isAuth, user } = useSelector((state) => state.auth);

  const token = getAuthToken();
  const roles = token ? getRolesFromToken(token) : [];

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Prefer checking roles from JWT to avoid stale store role.
  if (!roles.includes("LAB_ADMIN") && user?.role !== "LAB_ADMIN") {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
};

export default LabAdminRoute;
