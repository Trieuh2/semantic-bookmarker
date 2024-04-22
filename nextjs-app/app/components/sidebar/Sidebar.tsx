import React from "react";
import { IoIosBookmarks, IoIosFolder } from "react-icons/io";
import { FaTrashAlt } from "react-icons/fa";
import { FaBoxArchive } from "react-icons/fa6";
import { HiHashtag } from "react-icons/hi";
import SidebarItem from "./SidebarItem";
import clsx from "clsx";
import SidebarGroup from "./SidebarGroup";
import { useBookmarks } from "@/app/context/BookmarkContext";

const Sidebar: React.FC = () => {
  const { collections, tags } = useBookmarks();

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
      <SidebarItem
        href="/bookmarks"
        label="All bookmarks"
        icon={IoIosBookmarks}
      />
      <SidebarItem href="/unsorted" label="Unsorted" icon={FaBoxArchive} />
      <SidebarItem href="/trash" label="Trash" icon={FaTrashAlt} />

      {/* Collections */}
      <SidebarGroup name="Collections" count={collections?.length}>
        <div>
          {collections &&
            collections.map((collection) => (
              <SidebarItem
                key={collection.id}
                href={`/collection/${collection.id}`}
                label={collection.name}
                icon={IoIosFolder}
              />
            ))}
        </div>
      </SidebarGroup>

      {/* Tags */}
      <SidebarGroup name="Tags" count={collections?.length}>
        <div>
          {tags &&
            tags.map((tag) => (
              <SidebarItem
                key={tag.id}
                href={`/tag/${tag.id}`}
                label={tag.name}
                icon={HiHashtag}
              />
            ))}
        </div>
      </SidebarGroup>
    </div>
  );
};

export default Sidebar;
