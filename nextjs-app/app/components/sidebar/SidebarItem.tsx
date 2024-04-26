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
import { useAuth } from "@/app/context/AuthContext";
import { useBookmarks } from "@/app/context/BookmarkContext";
import { deleteResource } from "@/app/libs/resourceActions";

interface SidebarItemProps {
  href: string;
  label: string;
  icon?: IconType;
  count?: number | null;
  type?: string;
  identifier?: string; // collectionId or tagId
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  href,
  label,
  icon: Icon,
  count,
  type,
  identifier,
}) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isOverflowMenuOpened, setIsOverflowMenuOpened] =
    useState<boolean>(false);
  const overflowMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { sessionToken } = useAuth();
  const { filterResourceState } = useBookmarks();
  const isActive = pathname === href;

  // Side effect to close overflow menu when clicking outside of the menu
  useEffect(() => {
    // Function to handle clicks outside the menu
    const handleClickOutside = (event: MouseEvent) => {
      if (
        overflowMenuRef.current &&
        !overflowMenuRef.current.contains(event.target as Node)
      ) {
        setIsOverflowMenuOpened(false);
      }
    };

    document.addEventListener("mouseup", handleClickOutside);

    return () => {
      document.removeEventListener("mouseup", handleClickOutside);
    };
  }, [isOverflowMenuOpened]);

  const menuOptions = useMemo(() => {
    const getMenuOptions = (type: string, identifier: string) => {
      return [
        {
          label: `Delete ${type.charAt(0).toUpperCase() + type.slice(1)}`,
          action: () => handleDelete(type, identifier),
        },
      ];
    };
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
  }, [isOverflowMenuOpened]);

  const handleDelete = useCallback((type: string, identifier: string) => {
    const onSuccess = (type: string, identifier: string) => {
      filterResourceState(type, identifier);
    };

    const onError = (error: any) => {
      console.error(`Error deleting type ${type}:`, error);
    };

    deleteResource(type, identifier, sessionToken, onSuccess, onError);
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
};

export default SidebarItem;
