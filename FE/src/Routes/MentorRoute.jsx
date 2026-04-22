import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const MentorRoute = () => {
  const { isAuth, user } = useSelector((state) => state.auth);

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "MENTOR") {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
};

export default MentorRoute;
