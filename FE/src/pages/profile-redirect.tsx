import React, { useMemo } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const roleToProfilePath = (role?: string) => {
  const r = String(role || "").toUpperCase();
  if (r === "SYSTEM_ADMIN") return "/system-admin/profile";
  if (r === "LAB_ADMIN") return "/lab-admin/profile";
  if (r === "COMPANY") return "/enterprise/profile";
  if (r === "MENTOR") return "/mentor/profile";
  // TALENT / TALENT_LEADER / USER
  return "/candidate/profile";
};

const ProfileRedirect: React.FC = () => {
  const { user } = useSelector((state: any) => state.auth);
  const to = useMemo(() => roleToProfilePath(user?.role), [user?.role]);
  return <Navigate to={to} replace />;
};

export default ProfileRedirect;
