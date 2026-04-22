import React from "react";
import useDarkMode from "@/hooks/useDarkMode";
import { Link } from "react-router-dom";
import useWidth from "@/hooks/useWidth";
import { useSelector } from "react-redux";
import { getDashboardLink } from "@/hooks/useMenuItems";

import MainLogo from "@/assets/images/logo/logo_UTH.png";
import LogoWhite from "@/assets/images/logo/logo_UTH.png";
import MobileLogo from "@/assets/images/logo/logo_UTH.png";
import MobileLogoWhite from "@/assets/images/logo/logo_UTH.png";
const Logo = () => {
  const [isDark] = useDarkMode();
  const { width, breakpoints } = useWidth();
  const { user } = useSelector((state) => state.auth);
  const dashboardLink = user?.role ? `/${getDashboardLink(user.role)}` : "/";

  return (
    <div>
      <Link to={dashboardLink}>
        {width >= breakpoints.xl ? (
          <img src={isDark ? LogoWhite : MainLogo} alt="" />
        ) : (
          <img src={isDark ? MobileLogoWhite : MobileLogo} alt="" />
        )}
      </Link>
    </div>
  );
};

export default Logo;
