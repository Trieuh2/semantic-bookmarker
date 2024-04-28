"use client";

import BookmarkList from "@/app/components/bookmarks/BookmarksList";
import { useAuth } from "@/app/context/AuthContext";
import { axiosFetchResource } from "@/app/libs/resourceActions";
import { FullBookmarkType } from "@/app/types";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

interface BookmarksSearchPageProps {}

const BookmarksSearchPage: React.FC<BookmarksSearchPageProps> = () => {
  const [initialItems, setInitialItems] = useState<FullBookmarkType[] | null>(
    []
  );
  const { sessionToken } = useAuth();
  const searchParams = useSearchParams();

  // Fetch the Bookmark records
  useEffect(() => {
    if (sessionToken) {
      const fetchBookmarks = async () => {
        const searchQuery = searchParams.get("q");
        const params = {
          searchQuery,
        };
        const bookmarks = await axiosFetchResource(
          "bookmark",
          sessionToken,
          params
        );
        setInitialItems(bookmarks);
      };
      fetchBookmarks();
    }
  }, [sessionToken, searchParams]);

  return (
    <>
      <BookmarkList initialItems={initialItems ?? []} />
    </>
  );
};

export default BookmarksSearchPage;
