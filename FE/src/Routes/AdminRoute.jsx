import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const AdminRoute = () => {

  const { isAuth, user } = useSelector((state) => state.auth);

  // Chưa đăng nhập
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  // Không phải system admin
  if (user?.role !== "SYSTEM_ADMIN") {
    return <Navigate to="/403" replace />;
  }

  // ✅ BẮT BUỘC dùng Outlet
  return <Outlet />;
};

export default AdminRoute;
