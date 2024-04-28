"use client";

import BookmarkList from "@/app/components/bookmarks/BookmarksList";
import React from "react";

interface CollectionsDetailedPageProps {}

const CollectionsDetailedPage: React.FC<
  CollectionsDetailedPageProps
> = () => {
  return (
    <>
      <BookmarkList />
    </>
  );
};

export default CollectionsDetailedPage;
