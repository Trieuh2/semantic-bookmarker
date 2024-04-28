"use client";

import BookmarkList from "@/app/components/bookmarks/BookmarksList";
import { useAuth } from "@/app/context/AuthContext";
import { fetchResource } from "@/app/libs/resourceActions";
import { FullBookmarkType } from "@/app/types";
import { getUrlInfo } from "@/app/utils/urlActions";
import { usePathname, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

interface CollectionsSearchPageProps {}

const CollectionsSearchPage: React.FC<CollectionsSearchPageProps> = () => {
  const [initialItems, setInitialItems] = useState<FullBookmarkType[] | null>(
    []
  );
  const { sessionToken } = useAuth();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Fetch the Bookmark records
  useEffect(() => {
    if (sessionToken) {
      const fetchBookmarks = async () => {
        const searchQuery = searchParams.get("q");
        const urlInfo = getUrlInfo(pathname);

        const params = {
          searchQuery,
          collectionId: urlInfo.id
        };
        const bookmarks = await fetchResource("bookmark", sessionToken, params);
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

export default CollectionsSearchPage;
