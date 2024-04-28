"use client";

import BookmarkList from "@/app/components/bookmarks/BookmarksList";
import React from "react";

interface BookmarksSearchPageProps {}

const BookmarksSearchPage: React.FC<BookmarksSearchPageProps> = () => {
  return (
    <>
      <BookmarkList />
    </>
  );
};

export default BookmarksSearchPage;
