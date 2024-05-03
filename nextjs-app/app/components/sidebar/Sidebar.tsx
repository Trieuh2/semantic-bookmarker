"use client";

import React, { useMemo } from "react";
import { IoIosBookmarks, IoIosFolder } from "react-icons/io";
import { FaBoxArchive } from "react-icons/fa6";
import { HiHashtag } from "react-icons/hi";
import SidebarItem from "./SidebarItem";
import clsx from "clsx";
import SidebarGroup from "./SidebarGroup";
import { useBookmarks } from "@/app/context/BookmarkContext";

const Sidebar: React.FC = () => {
  const { state } = useBookmarks();

  const unsortedCollection = useMemo(() => {
    const collection = state.collections.find(
      (collection) => collection.isDefault
    );
    return collection;
  }, [state.collections]);

  const collectionItems = useMemo(
    () =>
      state.collections
        .filter((collection) => !collection.isDefault)
        .map((collection) => (
          <SidebarItem
            key={`collection-${collection.id}`}
            href={`/home/collections/${collection.id}`}
            label={collection.name}
            icon={IoIosFolder}
            count={collection._count.bookmarks}
            resourceType="collection"
            identifier={collection.id}
          />
        )),
    [state.collections]
  );

  const tagItems = useMemo(
    () =>
      state.tags.map((tag) => (
        <SidebarItem
          key={`tag-${tag.id}`}
          href={`/home/tags/${tag.id}`}
          label={tag.name}
          icon={HiHashtag}
          count={tag._count.tagToBookmarks}
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
      />
      <SidebarItem
        href={`/home/collections/${unsortedCollection?.id}`}
        count={unsortedCollection?._count.bookmarks}
        label="Unsorted"
        icon={FaBoxArchive}
      />

      {/* Collections */}
      {/* Subtract 1 from count due to "Unsorted" being a collection */}
      <SidebarGroup
        name="Collections"
        count={Math.max(state.collections.length - 1, 0)}
      >
        <div>{collectionItems}</div>
      </SidebarGroup>

      {/* Tags */}
      <SidebarGroup name="Tags" count={state.tags.length}>
        <div>{tagItems}</div>
      </SidebarGroup>
    </div>
  );
};

Sidebar.displayName = "Sidebar";
export default Sidebar;
