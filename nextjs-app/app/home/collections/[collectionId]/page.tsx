"use client";

import BookmarkList from "@/app/components/bookmarks/BookmarksList";
import { useAuth } from "@/app/context/AuthContext";
import { FullBookmarkType } from "@/app/types";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

interface CollectionsDetailedPageProps {}

const CollectionsDetailedPage: React.FC<
  CollectionsDetailedPageProps
> = ({}) => {
  const [initialItems, setInitialItems] = useState<FullBookmarkType[]>();
  const { userId, sessionToken } = useAuth();
  const pathname = usePathname();

  // Fetch the Bookmark records
  useEffect(() => {
    if (userId && sessionToken) {
      const fetchCollectionNameFromPath = () => {
        const splitPathname = pathname.split("/");
        const encodedCollectionName = splitPathname[splitPathname.length - 1];
        const decodedCollectionName = decodeURIComponent(encodedCollectionName);
        return decodedCollectionName;
      };

      const fetchBookmarks = async () => {
        const base_url = "http://localhost:3000/api/bookmark";
        const collection_name = fetchCollectionNameFromPath();
        const params = {
          collection_name: collection_name,
        };
        const queryString = new URLSearchParams(params).toString();
        const url = `${base_url}?${queryString}`;
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
  }, [userId, sessionToken]);

  return (
    <>
      <BookmarkList initialItems={initialItems ?? []} />
    </>
  );
};

export default CollectionsDetailedPage;
