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

  return (
    <div className={bookmarkListClasses}>
      {initialItems.map((bookmark, index) => {
        return (
          <BookmarkItem
            key={`bookmark-${bookmark.id}-${index}`}
            data={bookmark}
          />
        );
      })}
    </div>
  );
};

export default BookmarkList;
