"use client";

import React, { useEffect, useState } from "react";
import clsx from "clsx";
import { FaSearch } from "react-icons/fa";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface SearchBarProps {
  searchType: string;
  collectionId?: string;
}

const SearchBar: React.FC<SearchBarProps> = React.memo(
  ({ searchType, collectionId = "" }) => {
    const [searchValue, setSearchValue] = useState<string>("");
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Reset the search value when navigating to another page without search query parameters
    useEffect(() => {
      if (searchParams.size === 0) {
        setSearchValue("");
      }
    }, [pathname, searchParams.size]);

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
        let targetURL = ""; // Initialize target URL

        // Construct URL based on the context
        if (searchType === "bookmarks") {
          targetURL = searchValue
            ? `/home/${searchType}/search/?q=${searchValue}`
            : `/home/${searchType}/`;
        } else if (searchType === "collections") {
          targetURL = searchValue
            ? `/home/${searchType}/${collectionId}/search/?q=${searchValue}`
            : `/home/${searchType}/${collectionId}/`;
        }

        // Construct current URL from pathname and searchParams
        const queryString = searchParams.toString();
        const currentURL = queryString
          ? `${pathname}/?${queryString}`
          : pathname;

        // Check if the current full URL is the same as the target URL
        if (currentURL !== targetURL) {
          router.push(targetURL);
        }
      }
    };

    return (
      <div className={divClasses}>
        <FaSearch className={iconClasses} />
        <input
          id={"searchBarInput"}
          className={inputClasses}
          placeholder="Search"
          onKeyDown={(event) => handleKeyDown(event)}
          onChange={(event) => setSearchValue(event.currentTarget.value)}
          value={searchValue}
        ></input>
      </div>
    );
  }
);

SearchBar.displayName = "SearchBar";
export default SearchBar;
