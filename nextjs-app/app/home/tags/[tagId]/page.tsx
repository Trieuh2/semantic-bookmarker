"use client";

import BookmarkList from "@/app/components/bookmarks/BookmarksList";
import { useAuth } from "@/app/context/AuthContext";
import { useBookmarks } from "@/app/context/BookmarkContext";
import { fetchResource } from "@/app/libs/resourceActions";
import { FullBookmarkType } from "@/app/types";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

interface TagsDetailedPageProps {}

const TagsDetailedPage: React.FC<TagsDetailedPageProps> = ({}) => {
  const [initialItems, setInitialItems] = useState<FullBookmarkType[]>();
  const { userId, sessionToken } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { tags } = useBookmarks();

  // Fetch the Bookmark records
  useEffect(() => {
    if (userId && sessionToken) {
      const fetchBookmarks = async (tagId: string) => {
        const params = {
          tagId: tagId,
        };
        const bookmarks = await fetchResource("bookmark", sessionToken, params)
        setInitialItems(bookmarks)
      };

      const tagId = pathname.split("/").pop() ?? "";

      // Redirect if the tagId is not found
      if (!tags.some((tag) => tag.id === tagId)) {
        router.push("/home/bookmarks");
        return;
      }

      if (userId && sessionToken && tagId) {
        fetchBookmarks(tagId);
      }
    }
  }, [userId, sessionToken, pathname, tags, router]);

  return (
    <>
      <BookmarkList initialItems={initialItems ?? []} />
    </>
  );
};

export default TagsDetailedPage;
