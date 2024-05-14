"use client";

import clsx from "clsx";
import React, { useCallback, useRef, useState } from "react";
import OverflowMenuButton from "./OverflowMenuButton";
import OverflowMenu from "./OverflowMenu";
import SidebarInput from "./SidebarInput";
import { useBookmarks } from "@/app/context/BookmarkContext";
import { useAuth } from "@/app/context/AuthContext";
import { IoIosFolder } from "react-icons/io";
import { HiHashtag } from "react-icons/hi";
import {
  axiosCreateResource,
  createTempResource,
} from "@/app/libs/resourceActions";
import { CollectionWithBookmarkCount, TagWithBookmarkCount } from "@/app/types";
import { useSession } from "next-auth/react";

interface SidebarGroupProps {
  name: string;
  resourceType: "collection" | "tag";
  count?: number | null;
  children: React.ReactNode;
}

const SidebarGroup: React.FC<SidebarGroupProps> = React.memo(
  ({ name, resourceType, count, children }) => {
    const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
    const [isHovered, setIsHovered] = useState<boolean>(false);

    const [isOverflowMenuOpened, setIsOverflowMenuOpened] =
      useState<boolean>(false);
    const overflowMenuRef = useRef<HTMLDivElement>(null);

    const [isNewResourceFieldOpened, setIsNewResourceFieldOpened] =
      useState<boolean>(false);
    const [newResourceName, setNewResourceName] = useState<string>("");
    const newResourceInputRef = useRef<HTMLInputElement>(null);

    const { sessionToken } = useAuth();
    const { data } = useSession();
    const { state, dispatch } = useBookmarks();

    const groupName = count ? name + " (" + count.toString() + ")" : name;

    const menuOptions = [
      {
        label: `Add ${
          resourceType.charAt(0).toUpperCase() + resourceType.slice(1)
        }`,
        action: () => {
          handleCreateOptionClick();
          setIsOverflowMenuOpened(false);
        },
      },
    ];

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
              name
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
              { name },
              sessionToken,
              onSuccess,
              onError
            );
          }
        }
      },
      [sessionToken, state, dispatch, data?.userId]
    );

    return (
      <div>
        <div
          className={clsx(
            "relative flex w-full h-8 items-center py-1 px-3 gap-x-2 hover:cursor-pointer",
            isNewResourceFieldOpened ? "mb-8" : "mb-0"
          )}
          onClick={() => setIsCollapsed((prevState) => !prevState)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <span
            className="
              flex-grow
            text-stone-400
              text-sm
            "
          >
            {groupName}
          </span>
          <div className="absolute top-9 -left-0">
            <div
              className={clsx(
                "flex w-full items-center px-4 py-1 gap-x-2",
                !isNewResourceFieldOpened && "opacity-0 pointer-events-none"
              )}
            >
              {resourceType === "collection" && (
                <IoIosFolder className="flex-shrink-0 fill-orange-500" />
              )}
              {resourceType === "tag" && (
                <HiHashtag className="flex-shrink-0 fill-orange-500" />
              )}
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
              />
            </div>
          </div>
          <div
            className={clsx(
              "relative transition-opacity ease-in-out",
              isHovered ? "opacity-100" : "opacity-0"
            )}
          >
            <OverflowMenuButton
              onClick={(event) => {
                event.preventDefault();
                setIsOverflowMenuOpened((prev) => !prev);
              }}
            />
          </div>
          <OverflowMenu
            ref={overflowMenuRef}
            isOpen={isOverflowMenuOpened}
            menuOptions={menuOptions}
            onClickOutside={() => {
              setIsOverflowMenuOpened(false);
            }}
          />
        </div>

        {!isCollapsed && <>{children}</>}
      </div>
    );
  }
);

SidebarGroup.displayName = "SidebarGroup";
export default SidebarGroup;
