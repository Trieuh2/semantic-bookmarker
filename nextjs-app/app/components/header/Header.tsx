"use client";

import React, { useEffect, useState } from "react";
import SearchBar from "./SearchBar";
import { IoIosFolder } from "react-icons/io";
import { useBookmarks } from "@/app/context/BookmarkContext";
import { usePathname, useSearchParams } from "next/navigation";
import clsx from "clsx";
import { getUrlInfo } from "@/app/utils/urlActions";
import Link from "next/link";
import { Transition } from "@headlessui/react";
// import ActionsMenu from "./ActionsMenu";

const Header: React.FC = () => {
  const [headerTitle, setHeaderTitle] = useState<string>("");
  const [isSearchPage, setIsSearchPage] = useState<boolean>(false);
  const [searchType, setSearchType] = useState<string>("bookmarks"); // Search type can be set as 'bookmarks' or 'collections'
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [collectionName, setCollectionName] = useState<string>("");
  const [collectionId, setCollectionId] = useState<string>("");

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { state } = useBookmarks();

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

      let parentCollection;
      if (collection?.parentId) {
        parentCollection = state.collections.filter(
          (coll) => coll.id === collection.parentId
        )[0];
      }

      setHeaderTitle(
        (parentCollection ? parentCollection?.name + " / " : "") +
          collection?.name ?? ""
      );
      setCollectionName(collection?.name ?? "");
      setCollectionId(urlInfo.id);
    };

    fetchHeaderTitleFromUrl();
  }, [pathname, state.collections]);

  // Update search config based on URL params
  useEffect(() => {
    const urlInfo = getUrlInfo(pathname);

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
    setSearchConfig();
  }, [pathname, searchParams]);

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
      <Transition
        appear={true}
        show={true}
        enter="transition-opacity duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className={titleClasses}>
          {headerTitle !== "Bookmarks" && <IoIosFolder />}
          <span>{headerTitle}</span>
        </div>
      </Transition>

      {isSearchPage && (
        <>
          <div className={buttonContainerClasses}>
            <Link href={`/home/bookmarks/search?q=${searchQuery}`}>
              <button className={bookmarksSearchBtnClasses}>
                Search "{searchQuery}" in All Bookmarks
              </button>
            </Link>

            {collectionName && (
              <Link
                href={`/home/collections/${collectionId}/search?q=${searchQuery}`}
              >
                <button className={collectionsSearchBtnClasses}>
                  <div className="flex items-center justify-center">
                    Search "{searchQuery}" in
                    <IoIosFolder className="ml-2 mr-0.5" />
                    {collectionName}
                  </div>
                </button>
              </Link>
            )}
          </div>
          <div className="px-2 py-2 text-sm">
            {state.bookmarks.length === 1
              ? "1 search result"
              : `${state.bookmarks.length} search results`}
          </div>
        </>
      )}
      {/* <ActionsMenu /> */}
    </div>
  );
};

Header.displayName = "Header";
export default Header;
