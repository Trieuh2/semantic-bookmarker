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
import OverflowMenuButton from "./OverflowMenuButton";
import OverflowMenu from "./OverflowMenu";
import { useAuth } from "@/app/context/AuthContext";
import { useBookmarks } from "@/app/context/BookmarkContext";
import {
  axiosDeleteResource,
  axiosUpdateResource,
} from "@/app/libs/resourceActions";

interface SidebarItemProps {
  href: string;
  label: string;
  icon?: IconType;
  count?: number | null;
  resourceType?: "collection" | "tag";
  identifier?: string; // collectionId or tagId
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  href,
  label,
  icon: Icon,
  count,
  resourceType,
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
  const { state, dispatch } = useBookmarks();
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
    (resourceType: "collection" | "tag", identifier: string, name: string) => {
      const prevName = initialLabel;
      const trimmedName = name.trim();

      if (trimmedName && trimmedName !== initialLabel) {
        const onSuccess = () => {};

        const onError = (error: any) => {
          // Dispatch an action to revert to the previous state if there's an error
          setInitialLabel(prevName);
          setRenameValue(prevName);
          dispatch({
            type: "UPDATE_RESOURCE_NAME",
            resource: resourceType,
            identifier,
            name: prevName,
          });
        };

        const data = {
          id: identifier,
          name,
        };

        // Optimistic update
        setInitialLabel(trimmedName);
        dispatch({
          type: "UPDATE_RESOURCE_NAME",
          resource: resourceType,
          identifier,
          name: trimmedName,
        });
        axiosUpdateResource(
          resourceType,
          data,
          sessionToken,
          onSuccess,
          onError
        );
      } else if (!trimmedName) {
        setRenameValue(initialLabel);
      }
    },
    [initialLabel, sessionToken, dispatch]
  );

  const handleDelete = useCallback(
    (resourceType: "collection" | "tag", identifier: string) => {
      const stateResourceType = resourceType + "s";
      const previousResources =
        state[stateResourceType as "collections" | "tags"];

      const onSuccess = () => {};
      const onError = (error: any) => {
        console.error(`Error deleting type ${resourceType}:`, error);

        // Dispatch an action to revert to the previous state if there's an error
        dispatch({
          type: "SET_RESOURCES",
          resource: resourceType as "collection" | "tag",
          payload: previousResources,
        });
      };

      dispatch({
        type: "FILTER_RESOURCE",
        resource: resourceType,
        identifier,
      });
      axiosDeleteResource(
        resourceType,
        identifier,
        sessionToken,
        onSuccess,
        onError
      );
    },
    [sessionToken, state, dispatch]
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
        resourceType &&
        identifier &&
        renameInputRef.current &&
        !renameInputRef.current.contains(event.target as Node)
      ) {
        if (renameValue.trim() !== "" && renameValue.trim() !== initialLabel) {
          handleRename(resourceType, identifier, renameValue);
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
    resourceType,
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
  }, [pathname, href, label]);

  // Overflow menu options for renaming/deleting a tag or collection.
  const menuOptions = useMemo(() => {
    const getMenuOptions = (
      resourceType: "collection" | "tag",
      identifier: string
    ) => {
      return [
        {
          label: `Rename ${
            resourceType.charAt(0).toUpperCase() + resourceType.slice(1)
          }`,
          action: () => {
            handleRenameOptionClick();
          },
        },
        {
          label: `Delete ${
            resourceType.charAt(0).toUpperCase() + resourceType.slice(1)
          }`,
          action: () => handleDelete(resourceType, identifier),
        },
      ];
    };
    if (resourceType && identifier) {
      return getMenuOptions(resourceType, identifier);
    }
  }, [resourceType, identifier, handleDelete, handleRenameOptionClick]);

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
        {resourceType && identifier && (
          <input
            className={renameInputClasses}
            ref={renameInputRef}
            value={renameValue}
            onClick={(event) => event.preventDefault()}
            onChange={(event) => setRenameValue(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                setIsRenameOpened(false);
                handleRename(resourceType, identifier, renameValue);
              }
            }}
          ></input>
        )}
      </Link>
    </>
  );
};

export default SidebarItem;
