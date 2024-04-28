"use client";

import clsx from "clsx";
import React, { useCallback, useState } from "react";

interface SidebarGroupProps {
  name: string;
  count?: number | null;
  children: React.ReactNode;
}

const SidebarGroup: React.FC<SidebarGroupProps> = React.memo(
  ({ name, count, children }) => {
    const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
    const labelName = count ? name + " (" + count.toString() + ")" : name;

    const divClasses = clsx(`
    flex
    w-full
    h-8
    items-center
    py-1
    px-3
    gap-x-2
    hover:cursor-pointer
  `);

    const labelClasses = `
    flex-grow
    text-stone-400
    text-sm`;

    const handleGroupClick = useCallback(() => {
      setIsCollapsed((prevState) => !prevState);
    }, []);

    return (
      <div>
        <div className={divClasses} onClick={handleGroupClick}>
          <span className={labelClasses}>{labelName}</span>
        </div>
        {!isCollapsed && <>{children}</>}
      </div>
    );
  }
);

SidebarGroup.displayName = "SidebarGroup";
export default SidebarGroup;
