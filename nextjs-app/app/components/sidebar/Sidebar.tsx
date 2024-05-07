"use client";

import React, { useMemo } from "react";
import { IoIosBookmarks, IoIosFolder } from "react-icons/io";
import { FaBoxArchive } from "react-icons/fa6";
import { HiHashtag } from "react-icons/hi";
import SidebarItem from "./SidebarItem";
import clsx from "clsx";
import SidebarGroup from "./SidebarGroup";
import { useBookmarks } from "@/app/context/BookmarkContext";
import { CollectionWithBookmarkCount } from "@/app/types";

const Sidebar: React.FC = () => {
  const { state } = useBookmarks();

  const unsortedCollection = useMemo(() => {
    const collection = state.collections.find(
      (collection) => collection.isDefault
    );
    return collection;
  }, [state.collections]);

  const collectionItems = useMemo(() => {
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
            children={
              children &&
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
              )
            }
          />
        );
      });
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

  const scrollbarClasses = `
    overflow-y-scroll
    scrollbar
    scrollbar-track-stone-700
    scrollbar-thumb-stone-500
  `;

  const sidebarClasses = clsx(
    `
    h-full
    flex
    flex-col
    shrink-0
    grow-0
    w-72
    bg-neutral-800
    border-r
    border-neutral-700
    font-light
    `,
    scrollbarClasses
  );

  return (
    <div className={sidebarClasses}>
      {/* Static SidebarItems */}
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

      {/* Collections */}
      {/* Subtract 1 from count due to "Unsorted" being a collection */}
      <SidebarGroup
        name="Collections"
        resourceType="collection"
        count={Math.max(state.collections.length - 1, 0)}
      >
        <div>{collectionItems}</div>
      </SidebarGroup>

      {/* Tags */}
      <SidebarGroup name="Tags" resourceType="tag" count={state.tags.length}>
        <div>{tagItems}</div>
      </SidebarGroup>
    </div>
  );
};

Sidebar.displayName = "Sidebar";
export default Sidebar;
