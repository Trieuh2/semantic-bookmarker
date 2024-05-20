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
  axiosCreateResource,
  axiosDeleteResource,
  axiosUpdateResource,
  createTempResource,
} from "@/app/libs/resourceActions";
import SidebarInput from "./SidebarInput";
import { CollectionWithBookmarkCount, TagWithBookmarkCount } from "@/app/types";
import { useSession } from "next-auth/react";
import { IoIosFolder } from "react-icons/io";
import { MdOutlineExpandMore } from "react-icons/md";

interface SidebarItemProps {
  href: string;
  label: string;
  icon?: IconType;
  count?: number | null;
  resourceType: "collection" | "tag";
  identifier?: string; // collectionId or tagId
  parentName?: string;
  children?: React.ReactNode;
}

const SidebarItem: React.FC<SidebarItemProps> = React.memo(
  ({
    href,
    label,
    icon: Icon,
    count,
    resourceType,
    identifier,
    parentName,
    children,
  }) => {
    const { state, dispatch } = useBookmarks();
    const pathname = usePathname();
    const { sessionToken } = useAuth();
    const { data } = useSession();

    const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

    const [isActive, setIsActive] = useState<boolean>(false);
    const [isHovered, setIsHovered] = useState<boolean>(false);

    const [isOverflowMenuOpened, setIsOverflowMenuOpened] =
      useState<boolean>(false);
    const overflowMenuRef = useRef<HTMLDivElement>(null);

    const [isNewResourceFieldOpened, setIsNewResourceFieldOpened] =
      useState<boolean>(false);
    const [newResourceName, setNewResourceName] = useState<string>("");
    const newResourceInputRef = useRef<HTMLInputElement>(null);

    const [initialLabel, setInitialLabel] = useState<string>(label);
    const [isRenameOpened, setIsRenameOpened] = useState<boolean>(false);
    const [renameValue, setRenameValue] = useState<string>(label);
    const renameInputRef = useRef<HTMLInputElement>(null);

    const handleCreateOptionClick = () => {
      if (newResourceInputRef) {
        setIsNewResourceFieldOpened(true);
        newResourceInputRef.current?.focus();
      }
    };

    const handleCreate = useCallback(
      (resourceType: "collection" | "tag", name: string) => {
        if (name.trim() !== "") {
          const stateResourceType = resourceType + "s";
          const previousResources =
            state[stateResourceType as "collections" | "tags"];

          // Prevent the user from creating duplicates client-side
          const isUniqueName = !previousResources.some(
            (resource) => resource.name === name
          );

          const onSuccess = (
            newResource: CollectionWithBookmarkCount | TagWithBookmarkCount
          ) => {
            // Update the temporary object with the actual created object returned from server
            dispatch({
              type: "SET_RESOURCES",
              resource: resourceType as "collection" | "tag",
              payload: [...previousResources, newResource] as
                | CollectionWithBookmarkCount[]
                | TagWithBookmarkCount[],
            });
          };
          const onError = (error: any) => {
            console.error(`Error creating type ${resourceType}:`, error);
            // Dispatch an action to revert to the previous state if there's an error
            dispatch({
              type: "SET_RESOURCES",
              resource: resourceType as "collection" | "tag",
              payload: previousResources,
            });
          };

          // Perform new collection / tag creation
          if (isUniqueName) {
            const tempResource = createTempResource(
              data?.userId ?? "",
              resourceType,
              name,
              identifier
            );

            // Optimistic client-side update with temporary object
            dispatch({
              type: "SET_RESOURCES",
              resource: resourceType as "collection" | "tag",
              payload: [...previousResources, tempResource] as
                | CollectionWithBookmarkCount[]
                | TagWithBookmarkCount[],
            });

            // Server-side creation request
            axiosCreateResource(
              resourceType,
              { name, parentId: identifier },
              sessionToken,
              onSuccess,
              onError
            );
          }
        }
      },
      [sessionToken, state, dispatch, data?.userId, identifier]
    );

    const handleRenameOptionClick = useCallback(() => {
      if (renameInputRef) {
        setIsRenameOpened(true);
        renameInputRef.current?.focus();
      }
    }, [renameInputRef]);

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

        // Optimistic removal of resource
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
      if (resourceType && identifier && isRenameOpened) {
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
      isRenameOpened,
      renameValue,
      initialLabel,
      handleRename,
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
        const uniqueOptions = [];
        const sharedOptions = [
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

        // Only top-level collections can create nested collections
        if (resourceType === "collection" && !parentName) {
          uniqueOptions.push({
            label: `Add ${
              resourceType.charAt(0).toUpperCase() + resourceType.slice(1)
            }`,
            action: () => {
              handleCreateOptionClick();
              setIsOverflowMenuOpened(false);
            },
          });
        }

        return [...uniqueOptions, ...sharedOptions];
      };
      if (resourceType && identifier) {
        return getMenuOptions(resourceType, identifier);
      }
    }, [
      resourceType,
      identifier,
      handleDelete,
      handleRenameOptionClick,
      parentName,
    ]);

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
      transition
      duration-200`,
      isActive && "bg-neutral-600",
      !isActive && "hover:bg-neutral-700",
      isNewResourceFieldOpened ? "mb-8" : "mb-0"
    );

    return (
      <div className={clsx("relative")}>
        <Link legacyBehavior href={href} className={linkContainerClasses}>
          <a
            className={linkContainerClasses}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={(e) => {
              setIsActive(true);
            }}
          >
            {Icon && (
              <Icon
                className={clsx(
                  "flex-shrink-0 fill-orange-500",
                  parentName && "ml-4"
                )}
              />
            )}
            <span
              className={clsx(
                "flex-grow text-sm leading-6 truncate overflow-hidden",
                isRenameOpened && "text-transparent"
              )}
            >
              {initialLabel}
            </span>
            <span className="text-end text-xs text-gray-500 font-semibold">
              {count}
            </span>
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
            {children && (
              <button
                className={clsx(
                  `
                  flex  
                  shrink-0
                  grow-0
                  items-center
                  justify-center
                  transition-transform
                `,
                  isCollapsed ? "rotate-0" : "rotate-180"
                )}
                onClick={(event) => {
                  event.stopPropagation();
                  event.preventDefault();
                  setIsCollapsed((prev) => !prev);
                }}
              >
                <MdOutlineExpandMore />
              </button>
            )}

            {/* Rename input field */}
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
                nested={parentName ? true : false}
              />
            )}
          </a>
        </Link>

        {/* Nested input field for new collection */}
        {resourceType === "collection" && !parentName && (
          <div className="absolute top-9 -left-0">
            <div
              className={clsx(
                "flex w-full items-center ml-4 px-4 py-1 gap-x-2",
                !isNewResourceFieldOpened && "opacity-0 pointer-events-none"
              )}
            >
              <IoIosFolder className="flex shrink-0 fill-orange-500" />

              {/* New resource name input field */}
              <SidebarInput
                id={`new-${resourceType}`}
                ref={newResourceInputRef}
                isOpen={isNewResourceFieldOpened}
                value={newResourceName}
                onChange={(event) =>
                  setNewResourceName(event.currentTarget.value)
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    setIsNewResourceFieldOpened(false);
                    handleCreate(resourceType, newResourceName);
                    setNewResourceName("");
                  }
                }}
                onClickOutside={() => {
                  setNewResourceName("");
                  setIsNewResourceFieldOpened(false);
                }}
                nested
              />
            </div>
          </div>
        )}

        {!isCollapsed && <>{children}</>}
      </div>
    );
  }
);

SidebarItem.displayName = "SidebarItem";
export default SidebarItem;
