"use client";

import BookmarkList from "@/app/components/bookmarks/BookmarksList";
import { useAuth } from "@/app/context/AuthContext";
import { useBookmarks } from "@/app/context/BookmarkContext";
import { FullBookmarkType } from "@/app/types";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

interface CollectionsDetailedPageProps {}

const CollectionsDetailedPage: React.FC<
  CollectionsDetailedPageProps
> = ({}) => {
  const [initialItems, setInitialItems] = useState<FullBookmarkType[]>();
  const { userId, sessionToken } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { collections } = useBookmarks();

  // Fetch the Bookmark records
  useEffect(() => {
    const fetchBookmarks = async (collectionId: string) => {
      const base_url = "http://localhost:3000/api/bookmark";
      const params = { collectionId };
      const queryString = new URLSearchParams(params).toString();
      const url = `${base_url}?${queryString}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });

      if (response.status === 200) {
        const responseBody = await response.json();
        setInitialItems(responseBody.data);
      }
    };

    const collectionId = pathname.split("/").pop();

    // Redirect if the collection ID is not found
    if (!collections.some((collection) => collection.id === collectionId)) {
      router.push("/home/bookmarks");
      return;
    }

    if (userId && sessionToken && collectionId) {
      fetchBookmarks(collectionId);
    }
  }, [userId, sessionToken, pathname, collections, router]);

  return (
    <>
      <BookmarkList initialItems={initialItems ?? []} />
    </>
  );
};

export default CollectionsDetailedPage;
