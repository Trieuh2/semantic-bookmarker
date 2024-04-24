"use client";

import React from "react";
import Link from "next/link";
import { IconType } from "react-icons";
import { usePathname } from "next/navigation";
import clsx from "clsx";

interface SidebarItemProps {
  href: string;
  label: string;
  icon?: IconType;
  count?: number | null;
}

const SidebarItem: React.FC<SidebarItemProps> = React.memo(
  ({ href, label, icon: Icon, count }) => {
    const pathname = usePathname();
    const isActive = pathname === href;

    const linkContainerClasses = clsx(
      `
      flex
      w-full
      items-center
      py-1
      px-4
      gap-x-2
      text-stone-200
      transition-colors
      duration-100`,
      isActive && "bg-neutral-600",
      !isActive && "hover:bg-neutral-700"
    );
    const iconClasses = "flex-shrink-0 fill-orange-500";
    const labelClasses = "flex-grow text-sm leading-6 truncate overflow-hidden";
    const countLabelClasses = "text-end text-xs text-gray-500 font-semibold";

    return (
      <Link href={href} className={linkContainerClasses}>
        {Icon && <Icon className={iconClasses} />}
        <span className={labelClasses}>{label}</span>
        {<span className={countLabelClasses}>{count}</span>}
      </Link>
    );
  }
);

export default SidebarItem;
