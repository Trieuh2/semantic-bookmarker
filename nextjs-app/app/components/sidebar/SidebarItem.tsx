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
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import OverflowMenuButton from "./OverflowMenuButton";
import OverflowMenu from "./OverflowMenu";
import { useAuth } from "@/app/context/AuthContext";
import { useBookmarks } from "@/app/context/BookmarkContext";
import { deleteResource, updateResource } from "@/app/libs/resourceActions";

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

  const [initialLabel, setInitialLabel] = useState<string>(label);
  const [isRenameOpened, setIsRenameOpened] = useState<boolean>(false);
  const [renameValue, setRenameValue] = useState<string>(label);
  const renameInputRef = useRef<HTMLInputElement>(null);

  const pathname = usePathname();
  const { sessionToken } = useAuth();
  const { filterClientResourceState, updateClientResourceName } =
    useBookmarks();
  const [isActive, setIsActive] = useState<boolean>(false);

  const handleEllipsesClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      event.preventDefault(); // Prevent click from propagating to SidebarItem components
      setIsOverflowMenuOpened((prev) => !prev);
    },
    []
  );

  const handleRenameOptionClick = useCallback(() => {
    if (renameInputRef) {
      setIsRenameOpened(true);
      renameInputRef.current?.focus();
    }
  }, []);

  const closeMenu = useCallback(() => {
    setIsOverflowMenuOpened(false);
  }, []);

  const handleRename = useCallback(
    (type: string, identifier: string, name: string) => {
      const trimmedName = name.trim();
      if (trimmedName && trimmedName !== initialLabel) {
        const previousLabel = initialLabel;

        const onSuccess = () => {};

        const onError = (error: any) => {
          // Undo optimistic update
          setInitialLabel(previousLabel);
          updateClientResourceName(type, identifier, previousLabel);
        };

        const data = {
          id: identifier,
          name,
        };

        // Optimistic update
        setInitialLabel(trimmedName);
        updateClientResourceName(type, identifier, trimmedName);
        updateResource(type, data, sessionToken, onSuccess, onError);
      } else if (!trimmedName) {
        setRenameValue(initialLabel);
      }
    },
    [initialLabel, sessionToken, updateClientResourceName]
  );

  const handleDelete = useCallback(
    (type: string, identifier: string) => {
      const onSuccess = (type: string, identifier: string) => {
        filterClientResourceState(type, identifier);
      };

      const onError = (error: any) => {
        console.error(`Error deleting type ${type}:`, error);
      };

      deleteResource(type, identifier, sessionToken, onSuccess, onError);
    },
    [filterClientResourceState, sessionToken]
  );

  // Side effect to close overflow menu and rename field
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Overflow menu
      if (
        overflowMenuRef.current &&
        !overflowMenuRef.current.contains(event.target as Node)
      ) {
        setIsOverflowMenuOpened(false);
      }

      // Rename input field
      if (
        type &&
        identifier &&
        renameInputRef.current &&
        !renameInputRef.current.contains(event.target as Node)
      ) {
        if (renameValue.trim() !== "" && renameValue.trim() !== initialLabel) {
          handleRename(type, identifier, renameValue);
        } else {
          setRenameValue(initialLabel); // Reset to initial label if input field was empty
        }
        setIsRenameOpened(false);
      }
    };

    document.addEventListener("mouseup", handleClickOutside);

    return () => {
      document.removeEventListener("mouseup", handleClickOutside);
    };
  }, [
    isOverflowMenuOpened,
    initialLabel,
    renameValue,
    isRenameOpened,
    handleRename,
    type,
    identifier,
  ]);

  // Side effect to set active state
  useEffect(() => {
    const fetchIsActive = () => {
      if (
        pathname.startsWith(href) ||
        (pathname.startsWith("/home/bookmarks") && label === "All bookmarks")
      ) {
        setIsActive(true);
        return;
      } else {
        return setIsActive(false);
      }
    };
    fetchIsActive();
  }, [pathname]);

  // Overflow menu options for renaming/deleting a tag or collection.
  const menuOptions = useMemo(() => {
    const getMenuOptions = (type: string, identifier: string) => {
      return [
        {
          label: `Rename ${type.charAt(0).toUpperCase() + type.slice(1)}`,
          action: () => {
            handleRenameOptionClick();
          },
        },
        {
          label: `Delete ${type.charAt(0).toUpperCase() + type.slice(1)}`,
          action: () => handleDelete(type, identifier),
        },
      ];
    };
    if (type && identifier) {
      return getMenuOptions(type, identifier);
    }
  }, [type, identifier, handleDelete, handleRenameOptionClick]);

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
  const labelClasses = clsx(
    "flex-grow text-sm leading-6 truncate overflow-hidden",
    isRenameOpened && "text-transparent"
  );
  const countLabelClasses = "text-end text-xs text-gray-500 font-semibold";
  const renameInputClasses = clsx(
    `
    absolute
    left-9
    w-56
    py-0.5
    px-1
    rounded-md
    outline-0
    focused:outline
    bg-stone-900
    text-sm
    text-orange-300
    transition-opacity
    duration-100
  `,
    isRenameOpened
      ? "opacity-100 pointer-events-auto"
      : "opacity-0 pointer-events-none"
  );

  return (
    <>
      <Link
        href={href}
        className={linkContainerClasses}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {Icon && <Icon className={iconClasses} />}
        <span className={labelClasses}>{initialLabel}</span>
        <span className={countLabelClasses}>{count}</span>
        {isHovered && menuOptions && (
          <OverflowMenuButton onClick={handleEllipsesClick} />
        )}
        {menuOptions && (
          <OverflowMenu
            ref={overflowMenuRef}
            isOpen={isOverflowMenuOpened}
            closeMenu={closeMenu}
            menuOptions={menuOptions}
          />
        )}
        {type && identifier && (
          <input
            className={renameInputClasses}
            ref={renameInputRef}
            value={renameValue}
            onClick={(event) => event.preventDefault()}
            onChange={(event) => setRenameValue(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                setIsRenameOpened(false);
                handleRename(type, identifier, renameValue);
              }
            }}
          ></input>
        )}
      </Link>
    </>
  );
};

export default SidebarItem;
