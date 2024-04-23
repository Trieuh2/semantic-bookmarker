"use client";

import React from "react";
import Link from "next/link";
import { IconType } from "react-icons";

interface SidebarItemProps {
  href: string;
  label: string;
  icon?: IconType;
  count?: number | null;
}

const SidebarItem: React.FC<SidebarItemProps> = React.memo(
  ({ href, label, icon: Icon, count }) => {
    const linkContainerClasses = `
      flex
      w-full
      items-center
      py-1
      px-4
      gap-x-2
      text-stone-200
      hover:bg-neutral-700
      transition-colors
      duration-100`;
    const iconClasses = "flex-shrink-0 fill-orange-500";
    const labelClasses = "flex-grow text-sm leading-6 truncate overflow-hidden";
    const countLabelClasses = "text-end text-xs text-gray-500 font-semibold";

    return (
      <Link href={href} className={linkContainerClasses}>
        {Icon && <Icon className={iconClasses} />}
        <span className={labelClasses}>{label}</span>
        {count && <span className={countLabelClasses}>{count}</span>}
      </Link>
    );
  }
);

export default SidebarItem;
