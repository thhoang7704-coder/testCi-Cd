import React, { useMemo } from "react";
import { useLocation, NavLink } from "react-router-dom";
import Icon from "@/components/ui/Icon";
import { useMenuItems, getDashboardLink } from "@/hooks/useMenuItems";
import { useSelector } from "react-redux";

const Breadcrumbs = () => {
  const location = useLocation();
  const locationName = location.pathname.replace(/^\//, "");
  const menuItems = useMenuItems();
  const { user } = useSelector((state) => state.auth);
  const dashboardHref = user?.role ? `/${getDashboardLink(user.role)}` : "/";

  const match = useMemo(() => {
    const entries = [];

    menuItems.forEach((item) => {
      if (item?.isHeadr) return;
      if (item?.link) {
        entries.push({ link: item.link, title: item.title, groupTitle: "" });
      }
      if (item?.child) {
        item.child.forEach((child) => {
          if (child?.childlink) {
            entries.push({
              link: child.childlink,
              title: child.childtitle,
              groupTitle: item.title,
            });
          }
        });
      }
    });

    // Prefer exact match, otherwise longest prefix match.
    let best = entries.find((e) => e.link === locationName) || null;
    if (!best) {
      best = entries
        .filter((e) => locationName === e.link || locationName.startsWith(`${e.link}/`))
        .sort((a, b) => b.link.length - a.link.length)[0] || null;
    }

    return best;
  }, [menuItems, locationName]);

  const currentTitle = match?.title || locationName.split("/").filter(Boolean).pop() || "";
  const groupTitle = match?.groupTitle || "";

  return (
    <>
      <div className="md:mb-6 mb-4 flex space-x-3 rtl:space-x-reverse">
        <ul className="breadcrumbs">
          <li className="text-primary-500">
            <NavLink to={dashboardHref} className="text-lg">
              <Icon icon="heroicons-outline:home" />
            </NavLink>
            <span className="breadcrumbs-icon rtl:transform rtl:rotate-180">
              <Icon icon="heroicons:chevron-right" />
            </span>
          </li>
          {groupTitle && (
            <li className="text-primary-500">
              <button type="button" className="capitalize">
                {groupTitle}
              </button>
              <span className="breadcrumbs-icon rtl:transform rtl:rotate-180">
                <Icon icon="heroicons:chevron-right" />
              </span>
            </li>
          )}
          <li className="capitalize text-slate-500 dark:text-slate-400">
            {currentTitle}
          </li>
        </ul>
      </div>
    </>
  );
};

export default Breadcrumbs;
