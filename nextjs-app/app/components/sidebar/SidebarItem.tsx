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
import SidebarInput from "./SidebarInput";

interface SidebarItemProps {
  href: string;
  label: string;
  icon?: IconType;
  count?: number | null;
  resourceType?: "collection" | "tag";
  identifier?: string; // collectionId or tagId
}

const SidebarItem: React.FC<SidebarItemProps> = React.memo(
  ({ href, label, icon: Icon, count, resourceType, identifier }) => {
    const { state, dispatch } = useBookmarks();
    const pathname = usePathname();
    const { sessionToken } = useAuth();

    const [isActive, setIsActive] = useState<boolean>(false);
    const [isHovered, setIsHovered] = useState<boolean>(false);

    const [isOverflowMenuOpened, setIsOverflowMenuOpened] =
      useState<boolean>(false);
    const overflowMenuRef = useRef<HTMLDivElement>(null);

    const [initialLabel, setInitialLabel] = useState<string>(label);
    const [isRenameOpened, setIsRenameOpened] = useState<boolean>(false);
    const [renameValue, setRenameValue] = useState<string>(label);
    const renameInputRef = useRef<HTMLInputElement>(null);

    const handleRenameOptionClick = () => {
      if (renameInputRef) {
        setIsRenameOpened(true);
        renameInputRef.current?.focus();
      }
    };

    const handleRename = useCallback(
      (
        resourceType: "collection" | "tag",
        identifier: string,
        name: string
      ) => {
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

    const handleRenameInputClickOutside = useCallback(() => {
      // Rename the resource if changes were made
      if (resourceType && identifier) {
        if (renameValue.trim() !== "" && renameValue.trim() !== initialLabel) {
          handleRename(resourceType, identifier, renameValue);
        } else {
          setRenameValue(initialLabel); // Reset to initial label if input field was empty
        }
        setIsRenameOpened(false);
      }
    }, [
      resourceType,
      identifier,
      renameValue,
      initialLabel,
      handleRename,
      isRenameOpened,
    ]);

    // Side effect to set active state
    useEffect(() => {
      const fetchIsActive = () => {
        if (
          pathname.startsWith(href) ||
          (pathname.startsWith("/home/bookmarks") && label === "All bookmarks")
        ) {
          setIsActive(true);
        } else {
          setIsActive(false);
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
              setIsOverflowMenuOpened(false);
            },
          },
          {
            label: `Delete ${
              resourceType.charAt(0).toUpperCase() + resourceType.slice(1)
            }`,
            action: () => {
              handleDelete(resourceType, identifier);
              setIsOverflowMenuOpened(false);
            },
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

    return (
      <>
        <Link legacyBehavior href={href} className={linkContainerClasses}>
          <a
            className={linkContainerClasses}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={(e) => {
              setIsActive(true);
            }}
          >
            {Icon && <Icon className={iconClasses} />}
            <span className={labelClasses}>{initialLabel}</span>
            <span className={countLabelClasses}>{count}</span>
            {isHovered && menuOptions && (
              <OverflowMenuButton
                onClick={(event) => {
                  event.preventDefault();
                  setIsOverflowMenuOpened((prev) => !prev);
                }}
              />
            )}
            {menuOptions && (
              <OverflowMenu
                ref={overflowMenuRef}
                isOpen={isOverflowMenuOpened}
                menuOptions={menuOptions}
                onClickOutside={() => {
                  setIsOverflowMenuOpened(false);
                }}
              />
            )}
            {resourceType && identifier && (
              <SidebarInput
                id={href}
                ref={renameInputRef}
                isOpen={isRenameOpened}
                value={renameValue}
                onChange={(event) => setRenameValue(event.currentTarget.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    setIsRenameOpened(false);
                    handleRename(resourceType, identifier, renameValue);
                  }
                }}
                onClickOutside={handleRenameInputClickOutside}
              />
            )}
          </a>
        </Link>
      </>
    );
  }
);

SidebarItem.displayName = "SidebarItem";
export default SidebarItem;
