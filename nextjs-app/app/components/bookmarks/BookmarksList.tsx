"use client";

import { FullBookmarkType } from "@/app/types";
import clsx from "clsx";
import React, { useEffect, useState } from "react";
import BookmarkItem from "./BookmarkItem";
import { useBookmarks } from "@/app/context/BookmarkContext";
import { Transition } from "@headlessui/react";

const BookmarkList: React.FC = () => {
  const { state } = useBookmarks();
  const [displayBookmarks, setDisplayBookmarks] = useState<FullBookmarkType[]>(
    state.bookmarks
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Update bookmarks
  useEffect(() => {
    if (state.bookmarks !== displayBookmarks) {
      setDisplayBookmarks(state.bookmarks);
      setIsLoading(false);
    }
  }, [state.bookmarks, displayBookmarks]);

  // Synchronize bookmarks loading state
  useEffect(() => {
    setIsLoading(state.isBookmarksLoading);
  }, [state.isBookmarksLoading]);

  const memoizedBookmarkItems = React.useMemo(() => {
    return displayBookmarks.map((bookmark, index) => (
      <BookmarkItem
        index={index}
        key={`bookmark-${bookmark.id}-${index}`}
        data={bookmark}
      />
    ));
  }, [displayBookmarks]);

  const scrollbarClasses = `
    overflow-y-auto
    overflow-x-hidden
    scrollbar
    scrollbar-track-stone-700
    scrollbar-thumb-stone-500
  `;

  const bookmarkListClasses = clsx(
    `
    w-full
    h-full
    flex
    flex-col
    bg-zinc-800
    transition
    ease-in-out
    delay-75
    duration-75
  `,
    scrollbarClasses,
    isLoading ? "opacity-0" : "opacity-100"
  );

  const botDividerClasses = `
    relative  
    w-11/12
    h-px
    bg-zinc-700
    self-center
  `;

  return (
    <div className={bookmarkListClasses}>
      {!isLoading && (
        <Transition
          appear={true}
          show={true}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          {memoizedBookmarkItems}
          {/* Bottom divider with number of bookmarks found */}
          <div className="flex pb-4 items-center justify-center">
            <div className="flex items-center justify-center w-11/12 py-3">
              <div className={botDividerClasses}></div>
              <div className="flex items-center space-x-1 mx-2 text-neutral-400">
                <span className="text-sm">{displayBookmarks.length}</span>
                <span className="text-sm">
                  {displayBookmarks.length === 1 ? "bookmark" : "bookmarks"}
                </span>
              </div>
              <div className={botDividerClasses}></div>
            </div>
          </div>
        </Transition>
      )}
    </div>
  );
};

export default BookmarkList;
