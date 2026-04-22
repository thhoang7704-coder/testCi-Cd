import React, { useRef, useEffect, useState } from "react";

import Navmenu from "./Navmenu";
import SimpleBar from "simplebar-react";
import useSemiDark from "@/hooks/useSemiDark";
import useSkin from "@/hooks/useSkin";
import useDarkMode from "@/hooks/useDarkMode";
import { Link } from "react-router-dom";
import useMobileMenu from "@/hooks/useMobileMenu";
import Icon from "@/components/ui/Icon";
import { useMenuItems } from "@/hooks/useMenuItems";
import { getDashboardLink } from "@/hooks/useMenuItems";
import { useSelector } from "react-redux";

// import images
import MobileLogo from "@/assets/images/logo/logo_UTH.png";
import MobileLogoWhite from "@/assets/images/logo/logo_UTH.png";
import svgRabitImage from "@/assets/images/svg/rabit.svg";

const MobileMenu = ({ className = "custom-class" }) => {
  const scrollableNodeRef = useRef();
  const [scroll, setScroll] = useState(false);
  useEffect(() => {
    const node = scrollableNodeRef.current;
    if (!node) return;

    const handleScroll = () => {
      if (node.scrollTop > 0) {
        setScroll(true);
      } else {
        setScroll(false);
      }
    };
    node.addEventListener("scroll", handleScroll);

    return () => {
      node.removeEventListener("scroll", handleScroll);
    };
  }, [scrollableNodeRef]);

  const [isSemiDark] = useSemiDark();
  // skin
  const [skin] = useSkin();
  const [isDark] = useDarkMode();
  const [mobileMenu, setMobileMenu] = useMobileMenu();
  const { user } = useSelector((state) => state.auth);
  const menuItems = useMenuItems();
  const dashboardLink = user?.role ? `/${getDashboardLink(user.role)}` : "/";
  return (
    <div
      className={`${className} fixed  top-0 bg-white dark:bg-slate-800 shadow-lg  h-full   w-[248px]`}
    >
      <div className="logo-segment flex justify-between items-center bg-white dark:bg-slate-800 z-[9] h-[85px]  px-4 ">
        <Link to={dashboardLink}>
          <div className="flex items-center space-x-4">
            <div className="logo-icon">
              {!isDark && !isSemiDark ? (
                <img src={MobileLogo} alt="" />
              ) : (
                <img src={MobileLogoWhite} alt="" />
              )}
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                LabOdc
              </h1>
            </div>
          </div>
        </Link>
        <button
          type="button"
          onClick={() => setMobileMenu(!mobileMenu)}
          className="cursor-pointer text-slate-900 dark:text-white text-2xl"
        >
          <Icon icon="heroicons:x-mark" />
        </button>
      </div>

      <div
        className={`h-[60px]  absolute top-[80px] nav-shadow z-[1] w-full transition-all duration-200 pointer-events-none ${
          scroll ? " opacity-100" : " opacity-0"
        }`}
      ></div>
      <SimpleBar
        className="h-[calc(100%-80px)]"
        scrollableNodeProps={{ ref: scrollableNodeRef, className: "sidebar-menu-container" }}
      >
        <div className="sidebar-menu-content px-4">
          <Navmenu menus={menuItems} />
        </div>
      </SimpleBar>
    </div>
  );
};

export default MobileMenu;
