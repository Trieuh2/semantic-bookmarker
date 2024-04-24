"use client";

import BookmarkList from "@/app/components/bookmarks/BookmarksList";
import { useAuth } from "@/app/context/AuthContext";
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
        const url = "http://localhost:3000/api/bookmark";

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        });

        if (response.status === 200) {
          const responseBody = await response.json();
          setInitialItems(responseBody.data);
        }
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
