"use client";

import { FullBookmarkType } from "@/app/types";
import clsx from "clsx";
import React from "react";
import BookmarkItem from "./BookmarkItem";

interface BookmarkListProps {
  initialItems: FullBookmarkType[];
}

const BookmarkList: React.FC<BookmarkListProps> = ({ initialItems }) => {
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
        return <BookmarkItem key={`bookmark-${bookmark.id}-${index}`} data={bookmark} />;
      })}
    </div>
  );
};

export default BookmarkList;
