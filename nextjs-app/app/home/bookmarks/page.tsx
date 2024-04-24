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
  const { userId, sessionToken } = useAuth();

  // Fetch the Bookmark records
  useEffect(() => {
    if (userId && sessionToken) {
      const fetchBookmarks = async () => {
        const base_url = "http://localhost:3000/api/bookmark";
        const params = {
          userId: userId,
          sessionToken: sessionToken,
        };
        const queryString = new URLSearchParams(params).toString();
        const url = `${base_url}?${queryString}`;
        const response = await fetch(url);

        if (response.status === 200) {
          const responseBody = await response.json();
          setInitialItems(responseBody.data);
        }
      };
      fetchBookmarks();
    }
  }, [userId, sessionToken]);

  return (
    <>
      <BookmarkList initialItems={initialItems ?? []} />
    </>
  );
};

export default BookmarksPage;
