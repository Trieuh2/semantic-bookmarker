"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { IconType } from "react-icons";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import OverflowMenuButton from "../OverflowMenuButton";
import OverflowMenu from "../OverflowMenu";
import axios from "axios";

interface SidebarItemProps {
  href: string;
  label: string;
  icon?: IconType;
  count?: number | null;
  type?: string;
  identifier?: string; // collection_name or tagId
}

const renameCollection = (type: string, identifier: string) => {
  console.log("renameCollection");
};

const deleteCollection = (type: string, identifier: string) => {
  console.log("deleteCollection");
};

const getMenuOptions = (type: string, identifier: string) => {
  switch (type) {
    case "collection":
      return [
        { label: "Rename", action: () => renameCollection(type, identifier) },
        { label: "Delete", action: () => deleteCollection(type, identifier) },
      ];
  }
};

const SidebarItem: React.FC<SidebarItemProps> = React.memo(
  ({ href, label, icon: Icon, count, type, identifier }) => {
    const [isHovered, setIsHovered] = useState<boolean>(false);
    const [isOverflowMenuOpened, setIsOverflowMenuOpened] =
      useState<boolean>(false);
    const overflowMenuRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();
    const isActive = pathname === href;

    // Side effect to close overflow menu when clicking outside of the menu
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          overflowMenuRef.current &&
          !overflowMenuRef.current.contains(event.target as Node)
        ) {
          setIsOverflowMenuOpened(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    const menuOptions = useMemo(() => {
      if (type && identifier) {
        return getMenuOptions(type, identifier);
      }
    }, [type, identifier]);

    const handleEllipsesClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        event.preventDefault(); // Prevent click from propagating to SidebarItem components
        setIsOverflowMenuOpened((prev) => !prev);
      },
      []
    );

    const closeMenu = useCallback(() => {
      setIsOverflowMenuOpened(false);
    }, []);

    const linkContainerClasses = clsx(
      `
      relative
      flex
      grow-0
      shrink-0
      w-full
      h-8
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
      <Link
        href={href}
        className={linkContainerClasses}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {Icon && <Icon className={iconClasses} />}
        <span className={labelClasses}>{label}</span>
        <span className={countLabelClasses}>{count}</span>
        {isHovered && menuOptions && (
          <>
            <OverflowMenuButton onClick={handleEllipsesClick} />
          </>
        )}
        {menuOptions && (
          <OverflowMenu
            ref={overflowMenuRef}
            isOpen={isOverflowMenuOpened}
            closeMenu={closeMenu}
            menuOptions={menuOptions}
          />
        )}
      </Link>
    );
  }
);

export default SidebarItem;
