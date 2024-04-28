"use client";

import BookmarkList from "@/app/components/bookmarks/BookmarksList";
import React from "react";

interface BookmarksPageProps {}

const BookmarksPage: React.FC<BookmarksPageProps> = () => {
  return (
    <>
      <BookmarkList />
    </>
  );
};

export default BookmarksPage;
