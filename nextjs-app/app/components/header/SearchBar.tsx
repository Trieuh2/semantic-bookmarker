"use client";

import React, { useState } from "react";
import clsx from "clsx";
import { FaSearch } from "react-icons/fa";
import { useRouter } from "next/navigation";

interface SearchBarProps {
  searchType: string;
  collectionId?: string;
}

const SearchBar: React.FC<SearchBarProps> = React.memo(
  ({ searchType, collectionId = "" }) => {
    const [searchValue, setSearchValue] = useState<string>("");
    const router = useRouter();

    const divClasses = `
    relative
    flex
    items-center
    w-1/3
    px-2
  `;

    const iconClasses = `
    absolute
    left-4
  `;

    const inputClasses = clsx(
      `
    form-input
    w-full
    rounded-md
    border
    border-transparent
    py-1
    px-8
    shadow-sm
    bg-zinc-900
    text-white
    text-sm
    focus:outline-none
    focus:ring-2
    focus:ring-orange-300
    focus:bg-transparent
    transition-colors
    duration-100`
    );

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (event.key === "Enter") {
        // Bookmarks
        if (searchType === "bookmarks" && searchValue) {
          router.push(`/home/${searchType}/search/?q=${searchValue}`);
        } else if (searchType === "bookmarks" && !searchValue) {
          router.push(`/home/${searchType}/`);
        } else if (searchType === "collections" && searchValue) {
          router.push(
            `/home/${searchType}/${collectionId}/search/?q=${searchValue}`
          );
        } else {
          router.push(`/home/${searchType}/${collectionId}/search/`);
        }
      }
    };

    return (
      <div className={divClasses}>
        <FaSearch className={iconClasses} />
        <input
          className={inputClasses}
          placeholder="Search"
          onKeyDown={(event) => handleKeyDown(event)}
          onChange={(event) => setSearchValue(event.currentTarget.value)}
        ></input>
      </div>
    );
  }
);

SearchBar.displayName = "SearchBar"
export default SearchBar;
