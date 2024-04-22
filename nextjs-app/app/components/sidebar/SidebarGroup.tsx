import clsx from "clsx";
import React, { useState } from "react";

interface SidebarGroupProps {
  name: string;
  count?: number | null;
  children: React.ReactNode;
}

const SidebarGroup: React.FC<SidebarGroupProps> = ({
  name,
  count,
  children,
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const labelName = count ? name + " (" + count.toString() + ")" : name;

  const divClasses = clsx(`
    flex
    w-full
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

  return (
    <div>
      <div className={divClasses} onClick={() => setIsCollapsed(!isCollapsed)}>
        <span className={labelClasses}>{labelName}</span>
      </div>
      {!isCollapsed && <>{children}</>}
    </div>
  );
};

export default SidebarGroup;
