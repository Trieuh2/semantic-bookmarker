"use client";

import React, { useMemo } from "react";
import { IoIosBookmarks, IoIosFolder } from "react-icons/io";
import { FaBoxArchive } from "react-icons/fa6";
import { HiHashtag } from "react-icons/hi";
import { MdLogout } from "react-icons/md";
import SidebarItem from "./SidebarItem";
import SidebarGroup from "./SidebarGroup";
import { useBookmarks } from "@/app/context/BookmarkContext";
import { CollectionWithBookmarkCount } from "@/app/types";
import { axiosDeleteResource } from "@/app/libs/resourceActions";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

const Sidebar: React.FC = () => {
  const { state } = useBookmarks();
  const { sessionToken } = useAuth();
  const router = useRouter();

  const unsortedCollection = useMemo(() => {
    if (state.collections) {
      const collection = state.collections.find(
        (collection) => collection.isDefault
      );
      return collection;
    }
  }, [state.collections]);

  const collectionItems = useMemo(() => {
    if (state.collections) {
      // Creating a map to store parent-child relationships
      const childCollectionsMap = new Map();

      // Separating child collections in a map for quick lookup and counting bookmarks
      state.collections.forEach((collection) => {
        if (collection.parentId) {
          if (!childCollectionsMap.has(collection.parentId)) {
            childCollectionsMap.set(collection.parentId, {
              children: [],
              totalBookmarks: 0,
            });
          }
          let parent = childCollectionsMap.get(collection.parentId);
          parent.children.push(collection);
          parent.totalBookmarks += collection?._count?.bookmarks ?? 0;
        }
      });

      // Processing only non-default, top-level collections
      return state.collections
        .filter(
          (parentCollection) =>
            !parentCollection.isDefault && !parentCollection.parentId
        )
        .map((parentCollection) => {
          const children = childCollectionsMap.get(parentCollection.id);
          const totalBookmarks =
            (parentCollection?._count?.bookmarks ?? 0) +
            (children?.totalBookmarks ?? 0);

          return (
            <SidebarItem
              key={`collection-${parentCollection.id}`}
              href={`/home/collections/${parentCollection.id}`}
              label={parentCollection.name}
              icon={IoIosFolder}
              count={totalBookmarks}
              resourceType="collection"
              identifier={parentCollection.id}
            >
              {children &&
                children.children.map(
                  (childCollection: CollectionWithBookmarkCount) => (
                    <SidebarItem
                      key={`collection-${childCollection.id}`}
                      href={`/home/collections/${childCollection.id}`}
                      label={childCollection.name}
                      icon={IoIosFolder}
                      count={childCollection?._count?.bookmarks ?? 0}
                      resourceType="collection"
                      identifier={childCollection.id}
                      parentName={parentCollection.name}
                    />
                  )
                )}
            </SidebarItem>
          );
        });
    }
  }, [state.collections]);

  const tagItems = useMemo(
    () =>
      state.tags.map((tag) => (
        <SidebarItem
          key={`tag-${tag.id}`}
          href={`/home/tags/${tag.id}`}
          label={tag.name}
          icon={HiHashtag}
          count={tag?._count?.tagToBookmarks ?? 0}
          resourceType="tag"
          identifier={tag.id}
        />
      )),
    [state.tags]
  );

  const handleLogout = () => {
    // Server side signout


    // Client-side signout
    signOut();
    router.push("/");
  };

  return (
    <div className="h-screen flex flex-col border-r border-stone-700">
      {/* Static SidebarItems */}
      <div className="sticky top-0 z-10 bg-neutral-800 border-b border-stone-700">
        <SidebarItem
          href="/home/bookmarks"
          label="All bookmarks"
          icon={IoIosBookmarks}
          resourceType="collection"
        />
        <SidebarItem
          href={`/home/collections/${unsortedCollection?.id}`}
          count={unsortedCollection?._count.bookmarks}
          label="Unsorted"
          icon={FaBoxArchive}
          resourceType="collection"
        />
      </div>

      <div
        className="
          flex-grow
          h-full
          w-72
          bg-neutral-800
          border-r
          border-neutral-700
          font-light
          overflow-y-scroll
          scrollbar
          scrollbar-track-stone-700
          scrollbar-thumb-stone-500
        "
      >
        {/* Collections */}
        {/* Subtract 1 from count due to "Unsorted" being a collection */}
        <SidebarGroup
          name="Collections"
          resourceType="collection"
          count={
            state.collections?.length
              ? Math.max(state.collections.length - 1, 0)
              : 0
          }
        >
          <div>{collectionItems}</div>
        </SidebarGroup>

        {/* Tags */}
        <SidebarGroup name="Tags" resourceType="tag" count={state.tags.length}>
          <div>{tagItems}</div>
        </SidebarGroup>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-neutral-800 border-t border-neutral-700 h-16">
        <div
          className="flex items-center justify-center h-full gap-x-1 text-white text-sm hover:cursor-pointer"
          onClick={() => handleLogout()}
        >
          {/* Footer content here */}
          <MdLogout
            size={18}
            fill="white"
            style={{ transform: "rotate(180deg)" }}
          />
          Logout
        </div>
      </div>
    </div>
  );
};

Sidebar.displayName = "Sidebar";
export default Sidebar;
