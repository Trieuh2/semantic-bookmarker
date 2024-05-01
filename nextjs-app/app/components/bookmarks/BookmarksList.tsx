"use client";

import { FullBookmarkType } from "@/app/types";
import clsx from "clsx";
import React, { useEffect, useState } from "react";
import BookmarkItem from "./BookmarkItem";
import { useBookmarks } from "@/app/context/BookmarkContext";
import { useAuth } from "@/app/context/AuthContext";

interface BookmarkListProps {}

const BookmarkList: React.FC<BookmarkListProps> = () => {
  const sessionToken = useAuth();
  const { state } = useBookmarks();
  const [initialItems, setInitialItems] = useState<FullBookmarkType[]>([]);

  useEffect(() => {
    if (sessionToken) {
      setInitialItems(state.bookmarks);
    }
  }, [sessionToken, state.collections, state.tags, state.bookmarks]);

  const scrollbarClasses = `
    overflow-y-scroll
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
  `,
    scrollbarClasses
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
      {initialItems.map((bookmark, index) => {
        return (
          <BookmarkItem
            index={index}
            key={`bookmark-${bookmark.id}-${index}`}
            data={bookmark}
          />
        );
      })}
      {/* Bottom divider with number of bookmarks found */}
      <div className="flex pb-4 items-center justify-center">
        <div className="flex items-center justify-center w-11/12">
          <div className={botDividerClasses}></div>
          <div className="flex items-center space-x-1 mx-2 text-neutral-400">
            <span className="text-sm">{initialItems.length}</span>
            <span className="text-sm">
              {initialItems.length === 1 ? "bookmark" : "bookmarks"}
            </span>
          </div>
          <div className={botDividerClasses}></div>
        </div>
      </div>
    </div>
  );
};

export default BookmarkList;
