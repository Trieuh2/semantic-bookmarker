"use client";

import BookmarkList from "@/app/components/bookmarks/BookmarksList";
import { useAuth } from "@/app/context/AuthContext";
import { useBookmarks } from "@/app/context/BookmarkContext";
import { fetchResource } from "@/app/libs/resourceActions";
import { FullBookmarkType } from "@/app/types";
import { getUrlInfo } from "@/app/utils/urlActions";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

interface CollectionsDetailedPageProps {}

const CollectionsDetailedPage: React.FC<
  CollectionsDetailedPageProps
> = ({}) => {
  const [initialItems, setInitialItems] = useState<FullBookmarkType[]>();
  const { sessionToken } = useAuth();
  const pathname = usePathname();
  const { collections } = useBookmarks();

  // Fetch the Bookmark records related to this Collection
  useEffect(() => {
    const fetchBookmarks = async () => {
      const urlInfo = getUrlInfo(pathname);
      const collectionId = urlInfo.id
      
      const params = {
        collectionId,
      };
      const bookmarks = await fetchResource("bookmark", sessionToken, params);
      setInitialItems(bookmarks);
    };

    if (sessionToken) {
      fetchBookmarks();
    }
  }, [sessionToken, pathname, collections]);

  return (
    <>
      <BookmarkList initialItems={initialItems ?? []} />
    </>
  );
};

export default CollectionsDetailedPage;
