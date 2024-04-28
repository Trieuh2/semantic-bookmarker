"use client";

import BookmarkList from "@/app/components/bookmarks/BookmarksList";
import React from "react";

interface TagsDetailedPageProps {}

const TagsDetailedPage: React.FC<TagsDetailedPageProps> = ({}) => {
  return (
    <>
      <BookmarkList />
    </>
  );
};

export default TagsDetailedPage;
