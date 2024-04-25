"use client";

import BookmarkList from "@/app/components/bookmarks/BookmarksList";
import { useAuth } from "@/app/context/AuthContext";
import { useBookmarks } from "@/app/context/BookmarkContext";
import { fetchResource } from "@/app/libs/resourceActions";
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
      const params = {
        collectionId,
      };
      const bookmarks = await fetchResource("bookmark", sessionToken, params);
      setInitialItems(bookmarks);
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
