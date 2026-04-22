import React from "react";
import useSkin from "@/hooks/useSkin";

/**
 * @typedef {Object} CardProps
 * @property {import('react').ReactNode} [children]
 * @property {import('react').ReactNode} [title]
 * @property {import('react').ReactNode} [subtitle]
 * @property {import('react').ReactNode} [headerslot]
 * @property {string} [className]
 * @property {string} [bodyClass]
 * @property {boolean} [noborder]
 * @property {string} [titleClass]
 */

/** @param {CardProps} props */
const Card = ({
  children,
  title,
  subtitle,
  headerslot,
  className = "custom-class",
  bodyClass = "p-6",
  noborder,
  titleClass = "custom-class",
} = {}) => {
  const [skin] = useSkin();

  return (
    <div
      className={`
        card rounded-md bg-white dark:bg-slate-800   ${
          skin === "bordered"
            ? " border border-slate-200 dark:border-slate-700"
            : "shadow-base"
        }
   
    ${className}
        `}
    >
      {(title || subtitle) && (
        <header className={`card-header ${noborder ? "no-border" : ""}`}>
          <div>
            {title && <div className={`card-title ${titleClass}`}>{title}</div>}
            {subtitle && <div className="card-subtitle">{subtitle}</div>}
          </div>
          {headerslot && <div className="card-header-slot">{headerslot}</div>}
        </header>
      )}
      {children && <main className={`card-body ${bodyClass}`}>{children}</main>}
    </div>
  );
};

export default Card;
