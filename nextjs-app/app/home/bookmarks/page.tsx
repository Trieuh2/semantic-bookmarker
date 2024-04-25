"use client";

import BookmarkList from "@/app/components/bookmarks/BookmarksList";
import { useAuth } from "@/app/context/AuthContext";
import { fetchResource } from "@/app/libs/resourceActions";
import { FullBookmarkType } from "@/app/types";
import React, { useEffect, useState } from "react";

interface BookmarksPageProps {}

const BookmarksPage: React.FC<BookmarksPageProps> = () => {
  const [initialItems, setInitialItems] = useState<FullBookmarkType[] | null>(
    []
  );
  const { sessionToken } = useAuth();

  // Fetch the Bookmark records
  useEffect(() => {
    if (sessionToken) {
      const fetchBookmarks = async () => {
        const bookmarks = await fetchResource("bookmark", sessionToken);
        setInitialItems(bookmarks);
      };
      fetchBookmarks();
    }
  }, [sessionToken]);

  return (
    <>
      <BookmarkList initialItems={initialItems ?? []} />
    </>
  );
};

export default BookmarksPage;
