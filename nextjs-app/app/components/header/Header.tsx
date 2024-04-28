"use client";

import React, { useEffect, useState } from "react";
import SearchBar from "./SearchBar";
import { IoIosFolder } from "react-icons/io";
import { useBookmarks } from "@/app/context/BookmarkContext";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";
import { getUrlInfo } from "@/app/utils/urlActions";

interface HeaderProps {}

const Header: React.FC<HeaderProps> = React.memo(() => {
  const [headerTitle, setHeaderTitle] = useState<string>("");
  const [isSearchPage, setIsSearchPage] = useState<boolean>(false);
  const [searchType, setSearchType] = useState<string>("bookmarks"); // Search type can be set as 'bookmarks' or 'collections'
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [collectionName, setCollectionName] = useState<string>("");
  const [collectionId, setCollectionId] = useState<string>("");

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { state, dispatch } = useBookmarks();

  // Initialize labels, buttons, and search state
  useEffect(() => {
    const urlInfo = getUrlInfo(pathname);

    const fetchHeaderTitleFromUrl = () => {
      if (urlInfo.directory !== "collections") {
        setHeaderTitle("Bookmarks");
        return;
      }

      const collection = state.collections.filter(
        (collection) => collection.id === urlInfo.id
      )[0];
      setHeaderTitle(collection?.name ?? "");
      setCollectionName(collection?.name ?? "");
      setCollectionId(urlInfo.id);
    };

    const setSearchConfig = () => {
      if (urlInfo.directory === "collections") {
        setSearchType("collections");
      } else {
        setSearchType("bookmarks");
      }

      const query = searchParams.get("q");
      if (query) {
        setIsSearchPage(true);
        setSearchQuery(query);
      } else {
        setIsSearchPage(false);
        setSearchQuery("");
      }
    };

    fetchHeaderTitleFromUrl();
    setSearchConfig();
  }, [
    pathname,
    isSearchPage,
    searchType,
    searchParams,
    searchQuery,
    router,
    headerTitle,
    state.collections,
    collectionName,
    collectionId,
  ]);

  const divClasses = clsx(
    `
    flex
    flex-col
    grow-0
    shrink-0
    w-full
    bg-neutral-800
    p-2
    text-white
    border-b
    border-neutral-700
  `,
    isSearchPage ? "h-34" : "h-24"
  );

  const titleClasses = `
    flex
    items-center
    gap-2
    px-2
    pt-4
    pb-2
    text-xl
    font-bold
  `;

  const buttonContainerClasses = `
    flex
    gap-2
    px-2
  `;

  const sharedButtonClasses = `
    flex
    items-center
    py-1
    px-2
    border
    border-neutral-700
    bg-stone-800
    hover:bg-neutral-500
    hover:border-neutral-500
    rounded-md
    text-sm
    transition
  `;

  const bookmarksSearchBtnClasses = clsx(
    sharedButtonClasses,
    searchType === "bookmarks" && "border-orange-300 text-orange-300"
  );

  const collectionsSearchBtnClasses = clsx(
    sharedButtonClasses,
    searchType === "collections" && "border-orange-300 text-orange-300"
  );

  return (
    <div className={divClasses}>
      <SearchBar searchType={searchType} collectionId={collectionId} />
      <div className={titleClasses}>
        {headerTitle !== "Bookmarks" && <IoIosFolder />}
        <span>{headerTitle}</span>
      </div>
      {isSearchPage && (
        <div className={buttonContainerClasses}>
          <button
            className={bookmarksSearchBtnClasses}
            onClick={() =>
              router.push(`/home/bookmarks/search?q=${searchQuery}`)
            }
          >
            Search All Bookmarks
          </button>
          {collectionName && (
            <button
              className={collectionsSearchBtnClasses}
              onClick={() =>
                router.push(
                  `/home/collections/${collectionId}/search?q=${searchQuery}`
                )
              }
            >
              {"Search"}
              <IoIosFolder className="ml-2 mr-0.5" />
              {collectionName}
            </button>
          )}
        </div>
      )}
    </div>
  );
});

Header.displayName = "Header";
export default Header;
