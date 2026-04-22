import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const allowedUserRoles = new Set(["TALENT", "TALENT_LEADER", "USER"]);

const UserRoute = () => {
  const { isAuth, user } = useSelector((state) => state.auth);

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedUserRoles.has(user?.role)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
};

export default UserRoute;
