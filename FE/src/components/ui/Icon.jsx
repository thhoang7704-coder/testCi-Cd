import React from "react";
import { Icon } from "@iconify/react";

/**
 * @param {{
 *  icon: any;
 *  className?: string;
 *  width?: string | number;
 *  rotate?: string | number;
 *  hFlip?: boolean;
 *  vFlip?: boolean;
 * }} props
 */
const Icons = ({
  icon,
  className = "",
  width,
  rotate,
  hFlip,
  vFlip,
}) => {
  return (
    <>
      <Icon
        width={width}
        rotate={rotate}
        hFlip={hFlip}
        icon={icon}
        className={className}
        vFlip={vFlip}
      />
    </>
  );
};

export default Icons;
