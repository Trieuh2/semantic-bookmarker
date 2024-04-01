import React, { useState } from "react";
import { IoIosBookmarks, IoIosFolder } from "react-icons/io";
import { FaTrashAlt } from "react-icons/fa";
import { FaBoxArchive } from "react-icons/fa6";

import { HiHashtag } from "react-icons/hi";
import SidebarItem from "./SidebarItem";
import { Tag } from "@prisma/client";
import clsx from "clsx";
import { FullCollectionType } from "@/app/types";

interface SidebarProps {
  initialCollections: FullCollectionType[];
  initialTags: Tag[];
}

const Sidebar: React.FC<SidebarProps> = ({
  initialCollections,
  initialTags,
}) => {
  const [collections, setCollections] = useState(initialCollections);
  const [tags, setTags] = useState(initialTags);

  const sidebarClassNames = clsx(
    `
    h-full
    w-64
    bg-neutral-800
    border-r
    border-neutral-700
    font-light
    `
  );

  return (
    <div className={sidebarClassNames}>
      {/* Static SidebarItems */}
      <SidebarItem
        href="/bookmarks"
        label="All bookmarks"
        icon={IoIosBookmarks}
      />
      <SidebarItem href="/unsorted" label="Unsorted" icon={FaBoxArchive} />
      <SidebarItem href="/trash" label="Trash" icon={FaTrashAlt} />

      {/* Dynamic Collections */}
      <div>
        {collections.map((collection) => (
          <SidebarItem
            key={collection.id}
            href={`/collection/${collection.id}`}
            label={collection.name}
            icon={IoIosFolder}
            count={collection.bookmarks.length}
          />
        ))}
      </div>

      {/* Dynamic Tags */}
      <div>
        {tags.map((tag) => (
          <SidebarItem
            key={tag.id}
            href={`/tag/${tag.id}`}
            label={tag.name}
            icon={HiHashtag}
          />
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
