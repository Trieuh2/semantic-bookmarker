"use client";

import BookmarkList from "@/app/components/bookmarks/BookmarksList";
import React from "react";

interface CollectionsSearchPageProps {}

const CollectionsSearchPage: React.FC<CollectionsSearchPageProps> = () => {
  return (
    <>
      <BookmarkList />
    </>
  );
};

export default CollectionsSearchPage;
