"use client";

import React, { useMemo } from "react";
import { IoIosBookmarks, IoIosFolder } from "react-icons/io";
import { FaTrashAlt } from "react-icons/fa";
import { FaBoxArchive } from "react-icons/fa6";
import { HiHashtag } from "react-icons/hi";
import SidebarItem from "./SidebarItem";
import clsx from "clsx";
import SidebarGroup from "./SidebarGroup";
import { useBookmarks } from "@/app/context/BookmarkContext";

const Sidebar: React.FC = React.memo(() => {
  const { collections, tags } = useBookmarks();

  const collectionItems = useMemo(
    () =>
      collections.map((collection) => (
        <SidebarItem
          key={collection.id}
          href={`/home/collections/${collection.id}`}
          label={collection.name}
          icon={IoIosFolder}
        />
      )),
    [collections]
  );

  const tagItems = useMemo(
    () =>
      tags.map((tag) => (
        <SidebarItem
          key={tag.id}
          href={`/home/tags/${tag.id}`}
          label={tag.name}
          icon={HiHashtag}
        />
      )),
    [tags]
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
    w-80
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
      <SidebarItem href="/home/" label="All bookmarks" icon={IoIosBookmarks} />
      <SidebarItem href="/home/" label="Unsorted" icon={FaBoxArchive} />
      <SidebarItem href="/home/" label="Trash" icon={FaTrashAlt} />

      {/* Collections */}
      <SidebarGroup name="Collections" count={collections.length}>
        <div>{collectionItems}</div>
      </SidebarGroup>

      {/* Tags */}
      <SidebarGroup name="Tags" count={tags.length}>
        <div>{tagItems}</div>
      </SidebarGroup>
    </div>
  );
});

export default Sidebar;
